var Election = artifacts.require('./Election.sol');

contract("Election", function(account){

	var electionInstance;
	var candidateId;

	it("Initialized with two candidates", function(){
		return Election.deployed().then(function(instance){
			return instance.candidateCount();
		}).then(function(count){
			assert.equal(count,2);
		});
	});

	it("Initializes candidates with correct values", function(){
		return Election.deployed().then(function(i){
			electionInstance = i;
			return electionInstance.candidates(1);
		}).then(function(candidate){
			assert.equal(candidate[0],1,"Id is correct");
			assert.equal(candidate[1],"Candidate 1", "Name is correct");
			assert.equal(candidate[2],0,"Vote count is correct");
			return electionInstance.candidates(2);
		}).then(function(candidate){
			assert.equal(candidate[0],2,"Id is correct");
			assert.equal(candidate[1],"Candidate 2", "Name is correct");
			assert.equal(candidate[2],0,"Vote count is correct");
		});
	});

	it("Allow voters to cast vote", function(){
		return Election.deployed().then(function(instance){
			electionInstance = instance;
			candidateId = 1;
			return electionInstance.vote(candidateId, {from: account[0]});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, "An event was triggered");
			assert.equal(receipt.logs[0].event, "votedEvent", "Event name is correct");
			assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "Vote casted for correct candidate");
			return electionInstance.voters(account[0]);
		}).then(function(voted){
			assert(voted, "Voter is marked as voted");
			return electionInstance.candidates(candidateId);
		}).then(function(candidate){
			assert(candidate[2],1,"Increamented the vote count for candidate");
		});
	});


	it("Throw an exception for invalid candidate", function(){
		return Election.deployed().then(function(instance){
			electionInstance = instance;
			return electionInstance.vote(99, { from : account[1]} );
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
			return electionInstance.candidates(1);
		}).then(function(candidate){
			assert.equal(candidate[2],1,"Vote count for candidate is correct");
			return electionInstance.candidates(2);
		}).then(function(candidate){
			assert.equal(candidate[2],0,"Vote count for candidate is correct");
		});
	});

	it("Throw exception for double voting", function(){
		return Election.deployed().then(function(instance){
			electionInstance = instance;
			candidateId = 2;
			electionInstance.vote(candidateId, { from:account[1] });
			return electionInstance.candidates(candidateId);
		}).then(function(candidate){
			assert.equal(candidate[2],1,"Vote is casted");
			return electionInstance.vote(candidateId, {from:account[1]});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, "message must contain revert");
			return electionInstance.candidates(1);
		}).then(function(candidate){
			assert.equal(candidate[2],1,"Vote count for Candidate 1 is correct");
			return electionInstance.candidates(2);
		}).then(function(candidate){
			assert.equal(candidate[2], 1, "Vote count for Candidate 2 is correct");
		});
	});


});