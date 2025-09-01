// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//interfaces

interface IMiningToken {
    function mint(address to, uint256 amount) external;
}

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
    mapping(address => uint256[]) public minerBlocks;
    mapping(uint256 => mapping(address => uint256)) public seasonScore;
    mapping(uint256 => address[]) public seasonParticipants;
    mapping(uint256 => mapping(address => bool))private isSeasonParticipant;
    address[] public miners;
    address public owner;
    address public rewardsToken;
    uint256 public perBlockReward;
    uint256 public seasonStartTime;
    uint256 public seasonEndTime;
    uint256 public currentSeason;
    uint256 public seasonDuration=60*1 days;
    uint256 public firstPrize;
    uint256 public secondPrize;
    uint256 public thirdPrize;
    address public first;
    address public second;
    address public third;
    uint256 public currentSeasonPlayers=0;
    bool public pause;

//events
event MinerRegistered(address indexed miner);
event BlockMined(uint256 indexed id,address indexed miner,uint256 indexed difficulty);
event RewardPaid(address indexed to,uint256 amount,bytes32 reason);
event SeasonStarted(uint256 indexed seasonId,uint256  start,uint256  end,uint256  perblockReward);
event SeasonEnd(uint256 indexed seasonId,address[3] winners,uint256[3] amounts);
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

modifier seasonActive(){
    require(block.timestamp <= seasonEndTime,"Season has ended");
    require(block.timestamp >= seasonStartTime, "Season not yet started");
    _;
}

modifier seasonEnded(){
    require(block.timestamp > seasonEndTime,"Season is still active");
    _;
}

//functions
function registerMiner() public {
    require(!registered[msg.sender], "Already registered");
    registered[msg.sender] = true;
    miners.push(msg.sender);
    emit MinerRegistered(msg.sender);
}

function submitBlock(uint256 difficulty) onlyRegistered() seasonActive() public {
    require(difficulty > 0,"difficulty should be greater than zero");
    require(!pause);
    require(rewardsToken != address(0), "Rewards token not set");

    if(isSeasonParticipant[currentSeason][msg.sender]==false){
        isSeasonParticipant[currentSeason][msg.sender]=true;
        seasonParticipants[currentSeason].push(msg.sender);
        currentSeasonPlayers++;
    }

    blockCounter += 1;

    BlockSubmission memory b = BlockSubmission(
        blockCounter,
        msg.sender,
        difficulty,
        block.timestamp
    );

    Allblocks.push(b);
    seasonScore[currentSeason][msg.sender]+=difficulty;
    scores[msg.sender] += difficulty;
    _updateLeaderboard(msg.sender);
    minerBlocks[msg.sender].push(blockCounter);
    emit BlockMined(blockCounter,msg.sender,difficulty);
    IMiningToken(rewardsToken).mint(msg.sender,perBlockReward);
    emit RewardPaid(msg.sender,perBlockReward,keccak256("PER_BLOCK"));
}

function _updateLeaderboard(address miner) internal {
    uint256 score = seasonScore[currentSeason][miner];

    if (score > seasonScore[currentSeason][first]) {
        third = second;
        second = first;
        first = miner;
    } else if (score > seasonScore[currentSeason][second] && miner != first) {
        third = second;
        second = miner;
    } else if (score > seasonScore[currentSeason][third] && miner != first && miner != second) {
        third = miner;
    }
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
    emit TokenSet(token);
}

function setPerBlockReward(uint256 amount) onlyOwner()public{
    perBlockReward=amount;
} 

function setSeasonTime(uint256 duration) onlyOwner() public{
    seasonDuration=duration*1 days;
}

function startSeason() external onlyOwner seasonEnded{
   currentSeason+=1;
   seasonStartTime=block.timestamp;
   seasonEndTime=block.timestamp+seasonDuration;
   emit SeasonStarted(currentSeason,seasonStartTime,seasonEndTime,perBlockReward);
}

function setSeasonPrizes(uint256 _first, uint256 _second, uint256 _third) external onlyOwner seasonActive(){
    firstPrize=_first;
    secondPrize=_second;
    thirdPrize=_third;
}

function endSeasonAndDistribute() external onlyOwner seasonEnded {
    require(rewardsToken != address(0), "Rewards token not set");
    if (first != address(0)){
       IMiningToken(rewardsToken).mint(first, firstPrize);
       emit RewardPaid(first,firstPrize,keccak256("FIRST_WINNER"));
    }
    if(second !=address(0)){
       IMiningToken(rewardsToken).mint(second, secondPrize);
       emit RewardPaid(second, secondPrize,keccak256("SECOND_WINNER"));
    }
    if(third!=address(0)){
       IMiningToken(rewardsToken).mint(third, thirdPrize);
       emit RewardPaid(third, thirdPrize,keccak256("THIRD_WINNER"));
    }

    currentSeasonPlayers = 0;


    address[3] memory winners = [first, second, third];
    first=address(0);
    second=address(0);
    third=address(0);

    uint256[3] memory amounts = [firstPrize, secondPrize, thirdPrize];

    emit SeasonEnd(currentSeason, winners, amounts);
}

//safety functions

function setPause(bool p) external onlyOwner{
    pause=p;
}

function setOwner(address newOwner) external onlyOwner{
    owner=newOwner;
}


}
