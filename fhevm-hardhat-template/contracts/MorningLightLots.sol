// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title MorningLightLots
 * @notice Daily fortune drawing dApp with encrypted results
 * @dev Uses FHEVM to generate encrypted fortune numbers (1-64)
 */
contract MorningLightLots is ZamaEthereumConfig {
    // Constants
    uint256 public constant COOLDOWN_SECONDS = 5; // 5 seconds for testing (change to 120 for production)
    uint256 public constant DAILY_LIMIT = 1;
    uint256 public constant FORTUNE_COUNT = 64;
    uint256 public constant SECONDS_PER_DAY = 86400;

    // Structs
    struct FortuneRecord {
        euint16 encryptedFortuneNumber; // Encrypted fortune number (1-64)
        uint256 timestamp;              // When the fortune was drawn
        uint256 dayIndex;               // Day index (timestamp / SECONDS_PER_DAY)
    }

    // State variables
    mapping(address => FortuneRecord[]) private userFortunes;
    mapping(address => uint256) private lastDrawTimestamp;
    mapping(address => mapping(uint256 => uint256)) private dailyDrawCount; // user => dayIndex => count

    uint256 private drawCounter; // Global draw counter for unique IDs

    // Events
    event FortuneDrawn(
        address indexed user,
        uint256 indexed drawId,
        uint256 timestamp,
        uint256 dayIndex
    );

    /**
     * @notice Draw a new fortune
     * @dev Generates encrypted random number 1-64, checks daily limit and cooldown
     */
    function drawFortune() external {
        uint256 currentTime = block.timestamp;
        uint256 currentDayIndex = currentTime / SECONDS_PER_DAY;

        // Check cooldown
        require(
            currentTime >= lastDrawTimestamp[msg.sender] + COOLDOWN_SECONDS,
            "Cooldown period not finished"
        );

        // Check daily limit
        require(
            dailyDrawCount[msg.sender][currentDayIndex] < DAILY_LIMIT,
            "Daily draw limit reached"
        );

        // Generate encrypted random fortune number (1-64)
        // FHE.randEuint16(upperBound) generates random euint16 in range [0, upperBound)
        // So FHE.randEuint16(64) gives [0, 63], then add 1 to get [1, 64]
        euint16 randomInRange = FHE.randEuint16(64); // Returns 0-63
        euint16 fortuneNumber = FHE.add(randomInRange, FHE.asEuint16(1)); // Now 1-64

        // Allow only the caller to decrypt their fortune
        FHE.allowThis(fortuneNumber);
        FHE.allow(fortuneNumber, msg.sender);

        // Store fortune record
        FortuneRecord memory record = FortuneRecord({
            encryptedFortuneNumber: fortuneNumber,
            timestamp: currentTime,
            dayIndex: currentDayIndex
        });
        
        userFortunes[msg.sender].push(record);
        
        // Update state
        lastDrawTimestamp[msg.sender] = currentTime;
        dailyDrawCount[msg.sender][currentDayIndex]++;
        
        uint256 drawId = drawCounter;
        drawCounter++;

        emit FortuneDrawn(msg.sender, drawId, currentTime, currentDayIndex);
    }

    /**
     * @notice Get fortune by index for the caller
     * @param fortuneIndex Index in user's fortune array
     * @return Encrypted fortune number
     */
    function getMyFortune(uint256 fortuneIndex) external returns (euint16) {
        require(fortuneIndex < userFortunes[msg.sender].length, "Invalid fortune index");
        euint16 fortune = userFortunes[msg.sender][fortuneIndex].encryptedFortuneNumber;
        
        // Re-authorize the caller to decrypt (needed for Mock mode persistence)
        FHE.allow(fortune, msg.sender);
        
        return fortune;
    }

    /**
     * @notice Get total number of fortunes drawn by caller
     * @return Number of fortunes
     */
    function getMyFortuneCount() external view returns (uint256) {
        return userFortunes[msg.sender].length;
    }

    /**
     * @notice Get timestamp of caller's last draw
     * @return Timestamp
     */
    function getLastDrawTimestamp() external view returns (uint256) {
        return lastDrawTimestamp[msg.sender];
    }

    /**
     * @notice Get remaining cooldown time for caller
     * @return Seconds remaining (0 if ready)
     */
    function getRemainingCooldown() external view returns (uint256) {
        uint256 lastDraw = lastDrawTimestamp[msg.sender];
        if (lastDraw == 0) return 0;
        
        uint256 cooldownEnd = lastDraw + COOLDOWN_SECONDS;
        if (block.timestamp >= cooldownEnd) return 0;
        
        return cooldownEnd - block.timestamp;
    }

    /**
     * @notice Get caller's draw count for today
     * @return Draw count
     */
    function getTodayDrawCount() external view returns (uint256) {
        uint256 currentDayIndex = block.timestamp / SECONDS_PER_DAY;
        return dailyDrawCount[msg.sender][currentDayIndex];
    }

    /**
     * @notice Check if caller can draw now
     * @return true if can draw
     */
    function canDrawNow() external view returns (bool) {
        uint256 currentTime = block.timestamp;
        uint256 currentDayIndex = currentTime / SECONDS_PER_DAY;
        
        // Check cooldown
        if (currentTime < lastDrawTimestamp[msg.sender] + COOLDOWN_SECONDS) {
            return false;
        }
        
        // Check daily limit
        if (dailyDrawCount[msg.sender][currentDayIndex] >= DAILY_LIMIT) {
            return false;
        }
        
        return true;
    }
}

