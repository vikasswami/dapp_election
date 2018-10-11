pragma solidity ^0.4.24;

contract Election{
	struct Candidate{
		uint id;
		string name;
		uint voteCount;
	}

	// to store list of candidates
	mapping (uint => Candidate) public candidates;

	// to track who has casted vote
	mapping (address => bool) public voters;

	// number of candidates
	uint public candidateCount;

	event votedEvent(
		uint indexed _candidateId
	);

	// constructor 
	constructor() public {
		addCandidate("Candidate 1");
		addCandidate("Candidate 2");
	}

	// function to add candidate
	function addCandidate(string _candidateName) private {
		candidateCount++;
		candidates[candidateCount] = Candidate(candidateCount,_candidateName,0);
	}

	// function to cast vote
	function vote(uint _candidateId) public {
		//Check if voter has already voted
		require(!voters[msg.sender]);
		//check for valid candidate id
		require((_candidateId > 0 && _candidateId <= candidateCount));
		//require(_candidateId <= candidateCount);
		
		voters[msg.sender]=true;
		candidates[_candidateId].voteCount ++;
		emit votedEvent(_candidateId);
	}
}