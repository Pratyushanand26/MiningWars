// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MiningWars {
    struct BlockSubmission {
        uint256 id;
        address miner;
        uint256 difficulty;
        uint256 timestamp;
    }

    BlockSubmission[] public Allblocks;
    uint256 public blockCounter = 0;
    mapping(address => uint256) public scores;
    mapping(address => bool) public registered;
    mapping(address => uint256[]) minerBlocks;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function registerMiner() public {
        require(!registered[msg.sender], "Already registered");
        registered[msg.sender] = true;
    }

    function submitBlock(uint256 difficulty) public {
        require(registered[msg.sender], "Not registered");
        require(difficulty > 0,"difficulty should be greater than zero");
        blockCounter += 1;

        BlockSubmission memory b = BlockSubmission(
            blockCounter,
            msg.sender,
            difficulty,
            block.timestamp
        );

        Allblocks.push(b);
        scores[msg.sender] += difficulty;
        minerBlocks[msg.sender].push(blockCounter);
    }

    function getScore(address miner)public view returns(uint256){
        return scores[miner];
    }

    function getBlock(uint256 id) public view returns(BlockSubmission memory){
       require(id > 0 && id <= blockCounter, "Invalid block ID");

       return Allblocks[id-1];
    }

    function getAllBlocks() public view returns (BlockSubmission[] memory){
        return Allblocks;
    }
}
