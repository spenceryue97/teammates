/*

    InstructorFeedbackResults.js

*/



/**
 * function that select the whole table
 * @param el
 */

function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }
}


function submitFormAjax() {

	var formObject = $("#csvToHtmlForm");
	var formData = formObject.serialize();
	var content = $('#fsModalTable');
	var ajaxStatus = $('#ajaxStatus');
	
	$.ajax({
        type : 'POST',
        url :   "/page/instructorFeedbackResultsPage?" + formData,
        beforeSend : function() {
        	content.html("<img src='/images/ajax-loader.gif'/>");
        },
        error : function() {
        	ajaxStatus.html("Failed to load results table. Please try again.");
            content.html("<button class=\"btn btn-info\" onclick=\"submitFormAjax()\"> retry</button>");     	
        },
        success : function(data) {
            setTimeout(function(){
                if (!data.isError) {
                	var table = data.sessionResultsHtmlTableAsString;                	             	
                	content.html("<small>" + table + "</small>");
                	ajaxStatus.html(data.ajaxStatus);
                } else {
                    ajaxStatus.html(data.errorMessage);
                    content.html("<button class=\"btn btn-info\" onclick=\"submitFormAjax()\"> retry</button>");   
                }
            	               
                $("#statusMessage").html(data.statusForAjax);

            },500);
        }
    });
}


//Show/hide stats
function showHideStats(){
    if($("#show-stats-checkbox").is(":checked")){
        $(".resultStatistics").show();
    } else {
        $(".resultStatistics").hide();
    }
}

//Search functionality

function filterResults(searchText){
    // Reduce white spaces to only 1 white space
    searchText = (searchText.split('\\s+')).join(' ');

    var allPanelText = $("#frameBodyWrapper").find("div.panel-heading-text");

    for(var i=allPanelText.length-1; i >= 0; i--){
        
        var panelText = $(allPanelText[i]);
        var children = $(panelText).closest("div.panel").find("div.panel-heading-text").not(panelText);
        
        var hasChild = $(children).size() > 0;
        var isMatched = $(panelText).text().toLowerCase().indexOf(searchText) != -1;

        if(isMatched || (hasChild && $(children).is(":visible"))){
                $(panelText).closest("div.panel").show();
        } else {
            $(panelText).closest("div.panel").hide();
        }
    }
}

function updateResultsFilter(){
    filterResults($("#results-search-box").val());
}

function toggleCollapse(e, panels){
    if($(e).html().indexOf("Expand") != -1){
        panels = panels || $("div.panel-collapse");
        isExpandingAll = true;
        var i = 0;
        for(var idx = 0; idx < panels.length; idx++){
            if($(panels[idx]).attr('class').indexOf('in') == -1){
                setTimeout(showSingleCollapse, 100 * i, panels[idx]);
                i++;
            }
        }
        var htmlString = $(e).html();
        htmlString = htmlString.replace("Expand", "Collapse");
        $(e).html(htmlString);
    } else {
        panels = panels || $("div.panel-collapse");
        isCollapsingAll = true;
        var i = 0;
        for(var idx = 0; idx < panels.length; idx++){
            if($(panels[idx]).attr('class').indexOf('in') != -1){
                setTimeout(hideSingleCollapse, 100 * i, panels[idx]);
                i++;
            }
        }
        var htmlString = $(e).html();
        htmlString = htmlString.replace("Collapse", "Expand");
        $(e).html(htmlString);
    }
}

function showSingleCollapse(e){
    var heading = $(e).parent().children('.panel-heading');
    var glyphIcon = $(heading[0]).find('.glyphicon');
    $(glyphIcon[0]).removeClass('glyphicon-chevron-down');
    $(glyphIcon[0]).addClass('glyphicon-chevron-up');
    $(e).collapse("show");
    $(heading).find('a.btn').show();
}

function hideSingleCollapse(e){
    var heading = $(e).parent().children('.panel-heading');
    var glyphIcon = $(heading[0]).find('.glyphicon');
    $(glyphIcon[0]).removeClass('glyphicon-chevron-up');
    $(glyphIcon[0]).addClass('glyphicon-chevron-down');
    $(e).collapse("hide");
    $(heading).find('a.btn').hide();
}

function toggleSingleCollapse(e){
    if(!$(e.target).is('a') && !$(e.target).is('input')){
        var glyphIcon = $(this).find('.glyphicon');
        var className = $(glyphIcon[0]).attr('class');
        if(className.indexOf('glyphicon-chevron-up') != -1){
            hideSingleCollapse($(e.currentTarget).attr('data-target'));
        } else {
            showSingleCollapse($(e.currentTarget).attr('data-target'));
        }
    }
}

function getNextId(e){
    var id = $(e).attr('id');
    var nextId = "#panelBodyCollapse-" + (parseInt(id.split('-')[1]) + 1);
    return nextId;
}

function bindCollapseEvents(panels, numPanels){
    for(var i=0 ; i<panels.length ; i++){
        var heading = $(panels[i]).children(".panel-heading");
        var bodyCollapse = $(panels[i]).children(".panel-collapse");
        if(heading.length != 0 && bodyCollapse.length != 0){
            numPanels++;
            //$(heading[0]).attr("data-toggle","collapse");
            //Use this instead of the data-toggle attribute to let [more/less] be clicked without collapsing panel
            if($(heading[0]).attr('class') == 'panel-heading'){
                $(heading[0]).click(toggleSingleCollapse);
            }
            $(heading[0]).attr("data-target","#panelBodyCollapse-"+numPanels);
            $(heading[0]).attr("id","panelHeading-"+numPanels);
            $(heading[0]).css("cursor", "pointer");
            $(bodyCollapse[0]).attr('id', "panelBodyCollapse-"+numPanels);
        }
    }
    return numPanels;
}

window.onload = function(){
    var panels = $("div.panel");
    var numPanels = 0;

    bindCollapseEvents(panels, numPanels);
    $("a[id^='collapse-panels-button-section-']").on('click', function(){
        var isGroupByTeam = document.getElementById('frgroupbyteam').checked;
        var childPanelType;
        if(isGroupByTeam){
            childPanelType = 'div.panel.panel-warning';
        } else {
            childPanelType = 'div.panel.panel-primary';
        }
        var panels = $(this).closest('.panel-success').children('.panel-collapse').find(childPanelType).children('.panel-collapse');
        toggleCollapse(this, panels);
    });

    $("a[id^='collapse-panels-button-team-']").on('click', function(){
        var panels = $(this).closest('.panel-warning').children('.panel-collapse').find('div.panel.panel-primary').children('.panel-collapse');
        toggleCollapse(this, panels);
    });
};

//Set on ready events
$(document).ready(function(){
    $("#results-search-box").keyup(function(e){
        updateResultsFilter();
    });
    
    //prevent submitting form when enter is pressed.
    $("#results-search-box").keypress(function(e) {
        if(e.which == 13) {
            return false;
        }
    });

    if($(".panel-success").length > 1 || $(".panel-info").length > 1){
        $('#collapse-panels-button').show();
    } else {
        $('#collapse-panels-button').hide();
    }

    //Show/Hide statistics
    showHideStats();
    $("#show-stats-checkbox").change(showHideStats);
    
    //auto select the html table when modal is shown
    $('#fsResultsTableWindow').on('shown.bs.modal', function (e) {
		selectElementContents( document.getElementById('fsModalTable') );
    });
});


