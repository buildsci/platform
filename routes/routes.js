var shell = require('shelljs');

module.exports = {
    getHome: function(request, response){
        response.sendfile('./views/home.html');    
    },
    getSignUp: function(request, response){
        response.sendfile('./views/signup.html');  
    },
    getLogIn: function(request, response){
        response.sendfile('./views/login.html');  
    },
    getLite: function(request, response){
        response.render('lite');    
    },
    getLiteResults: function(request, response){
        response.render('literesults');    
    },
    getPartial: function(request, response){
        response.render('partial');    
    },
    
    getSubstantial: function(request, response) {
        response.render('substantial');
    },
    
    getComprehensive: function(request, response) {

        response.sendfile('./views/comprehensive.html');

    },
       
    
    getRemoteEngineRun: function(request, response){
        //var shell = require('shelljs');
        shell.echo('hello world');
        var str = shell.pwd();
        shell.echo(str);
        var nodeExec = shell.which('node');
        shell.echo(nodeExec);
        shell.exec('node --version', {silent:false}).output;

        shell.exec('which node', {silent:false}).output;
        
        shell.exec('pwd', {silent:false}).output;
        
        shell.exec('echo hello', {silent:false}).output;
        
        shell.cd('lib');

        shell.exec('pwd', {silent:false}).output;
        
        response.render('platform/remote');  
    },
    
};
