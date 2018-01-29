﻿//  ------------------------------------------------------------------------------------- //
var applicationfolder;
var vsiteurl;
var qdcconfig;          
var content;            
var layout;             

//push config to content
$.ajax({
    url: "./json/index_config.json", type: "GET", dataType: "json",
    success: function (data) {;
        content = data;
        console.log(content);
    }, error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
    }
});
$.ajax({
    url: "./json/qdc_config.json", type: "GET", dataType: "json",
    success: function (data) {;
        qdcconfig = data;
        siteurl = qdcconfig.config.general.connect;
        applicationfolder = qdcconfig.config.general.folder;
    }, error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
    }
}).then(function () {
//  ------------------------------------------------------------------------------------- //


    var rootPath = window.location.hostname;
    var portUrl = "81";

    if (window.location.port == "") {
        if ("https:" == window.location.protocol)
            portUrl = "443";
        else {
            portUrl = "81";
        }
    }
    else
        portUrl = window.location.port;

    var pathRoot = "//localhost:4848/extensions/";
    if (portUrl != "4848")
        pathRoot = "//" + rootPath + ":" + portUrl + "/resources/";

    var config = {
        host: window.location.hostname,
        prefix: "/ticket/",
        port: window.location.port,
        isSecure: window.location.protocol === "https:"
    };

    require.config({
        baseUrl: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") + config.prefix + "resources",
        paths: { app: (config.isSecure ? "https://" : "http://") + config.host + (config.port ? ":" + config.port : "") }
    });

    require([
        "js/qlik",
        "jquery",
        applicationfolder + "/js/bootstrap.min",
        applicationfolder + "/js/bootstrap-select.min",
        applicationfolder + "/js/bootstrap-notify.min",
        applicationfolder + "/js/jquery.cookie",
        applicationfolder + "/js/bootstrap-switch.min"
    ],

    function (qlik, $) {
	
        // User logged in
        var global = qlik.getGlobal(config);
        var scope = $('body').scope();
        scope.enigma = null;
        console.log("global.session", global.session);
    
        var unbind = scope.$watch(function() { return global.session.__enigmaApp }, function (newValue, oldValue) {
            if (newValue) {
                scope.enigma = newValue;
                console.log("bound Enigma", scope.enigma);
                unbind();
    
                scope.enigma.getAuthenticatedUser().then(function (auth) {
                    console.log(auth);
                    var str = auth.split(';');
                    var vUD = str[0].split('=');
                    var vUserID = str[1].split('=');
                    $('.loader').hide();
                    return $('#username').append(vUD[1] + '\\' + vUserID[1])

        
                }).then(function(){
                    scope.enigma.session.close();
                })
            }
        });

        //Building site dynamicly from json object
        for (var i = 0; i < content.items.length; i++) {
            layout = '<div class="col-xs-3 intro-hovergrid">';
            layout += '<div class="hover ehover1">';
            layout += '<div class="shape pattern ' + content.items[i].color + '">'
            layout += '<div class="shape-text"><i class="fa ' + content.items[i].icon + ' fa-lg" aria-hidden="true"></i></div></div>';
            layout += '<img class="img-responsive" src="' + content.items[i].picture + '" style="width: 100%; height: 180px;">';
            layout += '<div class="overlay"><h2>' + content.items[i].headline + '</h2><a href="' + content.items[i].path + '" target="_blank"><button class="info">' + content.items[i].launch + '</button></div>';
            layout += '</div><div class="intro-scenario">' + content.items[i].description + '</div></div>';
            $('#content').append(layout);

        };

    });
});