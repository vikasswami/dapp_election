App = {

  web3Provider : null,
  contracts : {},
  account : '0x0',
  hasVoted : false,

  init : function(){
    return App.initWeb3();  
  },

  initWeb3 : function(){
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
    }else{
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract : function(){

    $.getJSON("Election.json",function(election){
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);
      App.listenForEvents();
      return App.render();
    });
  },

  listenForEvents : function(){

    App.contracts.Election.deployed().then(function(instance){
      instance.votedEvent({},{
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error,event){
        console.log('event triggered ',event);
       // return App.render();
      });
    });

  },

  render : function(){

    var electionInstance;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(error,account){
      if(error == null){
        App.account = account;
        $('#accountAddress').html('Your account is: '+account);
      }
    });

    App.contracts.Election.deployed().then(function(instance){
      electionInstance = instance;
      return electionInstance.candidateCount();
    }).then(function(candidateCount){
      
      var candidateResults = $('#candidatesResults');
      candidateResults.empty();
     //candidateResults = '';

      var candidateSelect = $('#candidatesSelect');
      candidateSelect.empty();

      console.log("candidateCount: "+candidateCount);

      for(var i=1; i<=candidateCount; i++){
        electionInstance.candidates(i).then(function(candidate){
          var id = candidate[0];
          var name = candidate[1];
          var votes = candidate[2];

          var candidateResultsTemplate = '<tr><th>'+id+'</th><td>'+name+'</td><td>'+votes+'</td></tr>';
          var candidateSelectTemplate = "<option value='"+id+"'>"+name+"</option>";

          candidateResults.append(candidateResultsTemplate);
          candidateSelect.append(candidateSelectTemplate);

        });
      }

      return electionInstance.voters(App.account);

    }).then(function(hasVoted){
      if(hasVoted){
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(err){
      console.warn(err);
    });

  },

  castVote : function(){
    var candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed().then(function(instance){
      return instance.vote(candidateId, {from:App.account});
    }).then(function(result){
        $('#content').hide();
        $('#loader').show();
    }).catch(function(err){
      console.warn(err);
    });
  }



};

$(function(){
  $(window).load(function(){
    App.init();
  });
});