// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//structs
contract MiningWars {
    struct BlockSubmission {
        uint256 id;
        address miner;
        uint256 difficulty;
        uint256 timestamp;
    }

//state variables
    BlockSubmission[] public Allblocks;
    uint256 public blockCounter = 0;
    mapping(address => uint256) public scores;
    mapping(address => bool) public registered;
    mapping(address => uint256[]) minerBlocks;
    address[] public miners;
    address public owner;
    address public rewardsToken;
    uint256 public perBlockReward;
    uint256 public seasonBudget;
    uint256 public seasonStart;
    uint256 public seasonDuration=60 days;

//events
event MinerRegistered(address indexed miner);
event BlockMined(uint256 indexed id,address indexed miner,uint256 indexed difficulty);
event RewardPaid(address indexed to,uint256 amount,bytes32 reason);
event SeasonStarted(uint256 indexed seasonId,uint256  start,uint256  end,uint256  perblockReward);
event SeasonEnded(uint256 indexed seasonId,address[] winners,uint256[] amounts);
event TokenSet(address indexed token);
event ConfigUpdate(bytes32 what,uint256 value);

//constructor
    constructor() {
        owner = msg.sender;
    }

//modifiers

modifier onlyOwner(){
    require(msg.sender==owner,"You are not the owner");
    _;
}

modifier onlyRegistered(){
    require(registered[msg.sender]==true,"You are not registered");
    _;
}

//functions
    function registerMiner() public {
        require(!registered[msg.sender], "Already registered");
        registered[msg.sender] = true;
        miners.push(msg.sender);
        emit MinerRegistered(msg.sender);
    }

    function submitBlock(uint256 difficulty) onlyRegistered() public {
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
        emit BlockMined(blockCounter,msg.sender,difficulty);
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

    function setToken(address token) onlyOwner() public{
        rewardsToken=token;
    }

    function setPerBlockReward(uint256 amount) onlyOwner()public{
        perBlockReward=amount;
    } 

    function setSeasonBudget(uint256 budget) onlyOwner() public{
        seasonBudget=budget;
    }
}
