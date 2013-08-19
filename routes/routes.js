var shell = require('shelljs');

module.exports = {
    getHome: function(request, response){
        response.render('platform/home');    
    },
    getLite: function(request, response){
        response.render('platform/lite');    
    },
    getLiteResults: function(request, response){
        response.render('platform/literesults');    
    },
    getPartial: function(request, response){
        response.render('platform/partial');    
    },
    
    getSubstantial: function(request, response) {
        response.render('platform/substantial');
    },
    
    getComprehensive: function(request, response) {
        response.render('platform/comprehensive');
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
