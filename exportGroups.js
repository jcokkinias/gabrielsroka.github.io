/* 
This bookmarklet exports groups.

Setup:
1. Drag this to the bookmark toolbar:
javascript:(function(){document.body.appendChild(document.createElement("script")).src="https://gabrielsroka.github.io/exportGroups.js";})();

Usage:
1. Login to Okta Admin.
2. Open the dev console (F12).
3. Click the bookmark from your toolbar.
4. When the export is done, the groups are in the console. Save the results to a CSV file.
*/

(function () {
    var total = 0;
    var results = createDiv("Groups");
    console.clear();
    console.log("ignore,id,name,description,type");
    callAPI("/groups", showGroups);
    function showGroups() {
        if (this.responseText) {
            var groups = JSON.parse(this.responseText);
            for (var i = 0; i < groups.length; i++) {
                var g = groups[i];
                // Start with ',' because Chrome adds extra info at the beginning of each line.
                console.log(',' + g.id + ',"' + g.profile.name + '","' + (g.profile.description || "") + '",' + g.type);
            }
            total += groups.length;
            results.innerHTML = total + " groups.";
            var links = getLinks(this.getResponseHeader("Link"));
            if (links.next) {
                var path = links.next.replace(/.*api.v1/, ""); // links.next is an absolute URL; we need a relative URL.
                callAPI(path, showGroups);
            } else {
                results.innerHTML += " Done -- check the console for results.";
            }
        }
    }
    function callAPI(path, onload) {
        var request = new XMLHttpRequest();
        request.open("GET", "/api/v1" + path);
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.onload = onload;
        request.send();
    }
    function getLinks(headers) {
        headers = headers.split(", ");
        var links = {};
        for (var i = 0; i < headers.length; i++) {
            var matches = headers[i].match(/<(.*)>; rel="(.*)"/);
            links[matches[2]] = matches[1];
        }
        return links;
    }
    function createDiv(title) {
        var div = document.body.appendChild(document.createElement("div"));
        div.innerHTML = "<a onclick='document.body.removeChild(this.parentNode)'>" + title + " - close</a> " +
            "<a href='https://gabrielsroka.github.io/' target='_blank'>?</a>";
        div.style.position = "absolute";
        div.style.zIndex = "1000";
        div.style.left = "4px";
        div.style.top = "4px";
        div.style.backgroundColor = "white";
        div.style.padding = "8px";
        return div.appendChild(document.createElement("div"));
    }
})();
