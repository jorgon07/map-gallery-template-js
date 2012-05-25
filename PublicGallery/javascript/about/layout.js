// Dojo Requires
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("esri.arcgis.Portal");
dojo.require("dojo.NodeList-manipulate");
dojo.require("dojo.NodeList-traverse");
dojo.require("dojox.NodeList.delegate");
dojo.require("dijit.Dialog");
dojo.require("dojo.cookie");
dojo.require("dojo.io.script");
dojo.require("dojo.number");
/*------------------------------------*/
// on dojo load
/*------------------------------------*/
dojo.addOnLoad(function(){
	// set default configuration options
	setDefaultConfigOptions();
	// set app ID settings and call init after
	setAppIdSettings(function(){
		// create portal
		createPortal(function(){
			init();
		});
	});
});
/*------------------------------------*/
// Query Owner
/*------------------------------------*/
function queryOwnerInfo(obj){
	// default values
	var settings = {
		// Group Owner
		owner: '',
		// format
		dataType : 'json',
		// callback function with object
		callback: null
    };
	// If options exist, lets merge them with our default settings
	if(obj) { 
		dojo.mixin(settings,obj);
	}
	var q = 'username:' + settings.owner;
	var params = {
		q: q,
		v: configOptions.arcgisRestVersion,
		f: settings.dataType
	};
	portal.queryUsers(params).then(function(data){
		if(typeof settings.callback === 'function'){
			// call callback function with settings and data
			settings.callback.call(this,settings,data);
		}
	});
}
/*------------------------------------*/
// place about content into dom
/*------------------------------------*/
function insertAboutContent(userInfo){
	var node, html;
	if(userInfo){
		// users full name
		node = dojo.query("#fullName");
		if(node.length > 0 && userInfo.fullName){
			node.innerHTML(userInfo.fullName);
		}
		// users description
		node = dojo.query("#userDescription");
		if(node.length > 0 && userInfo.description){
			node.innerHTML(userInfo.description);
		}
		// users thumbnail
		node = dojo.query("#thumbnailUrl");
		if(node.length > 0 && userInfo.thumbnailUrl){
			html = '';
			if(configOptions.showProfileUrl){
				html += '<a class="ownerImage" href="' + getViewerURL('owner_page') + '" target="_blank">';
			}
			else{
				html += '<span class="ownerImage">';
			}
			html += '<img alt="' + userInfo.fullName + '" title="' + userInfo.fullName + '" src="' + userInfo.thumbnailUrl + '" width="150" height="150" />';
			if(configOptions.showProfileUrl){
				html += '</a>';
			}
			else{
				html += '</span>';
			}
			node.innerHTML(html);
		}		
		// users page
		if(configOptions.showProfileUrl){
			node = dojo.query("#userLink");
			if(node.length > 0 && userInfo.username){
				html = '<p><strong>' + i18n.viewer.mapPage.moreInformation + '</strong> <a href="' + getViewerURL('owner_page') + '" target="_blank">' + userInfo.username + '</a></p>';
				node.innerHTML(html);
			}
		}
	}
}
/*------------------------------------*/
// Init
/*------------------------------------*/
function init(){
	// set up params
	configUrlParams();
	// check for mobile cookie	
	checkMobileCookie();
	// Query group and then query maps
	queryGroup(function(){
		// query group info
		queryOwnerInfo({
			// Group Owner
			owner: configOptions.group.owner,
			// Executed after ajax returned
			callback: function(obj,data){
				if(data.results.length > 0){
					// place about content into dom
					insertAboutContent(data.results[0]);
				}
				else{
					// show error dialog
					var dialog = new dijit.Dialog({
						title: i18n.viewer.errors.general,
						content: i18n.viewer.errors.noMatches
					});
					dialog.show();
				}
			}
		});
	});
}