/*
	Author: 		Jack Hinkley
	Date:			Nov 28 2016
	Description: 	This is the main javascript file that contains most of the websites functionality
					and drives all user actions and communications to the databases endpoints. More JS
					files means there is more HTTP overhead, this is why all custom code is stored here.
*/

//	GLOBAL VARIABLES
var mobile_state = false;
var data = {};
//	Check to see if the page should go mobile	
mobile();

//	If the page is resized check to see if the page should go mobile
$(window).bind('resize', function(event) {
	mobile();
});

//	Set max length
$(".mybasket-content input").attr("max-length", "30");

//	Add Logout Button to nav
if($(".user").html() != ""){
	$("#nav #signup").addClass("hidden");
	$("#nav").append("<li class='submenu' id='logout'><a href='/logout/'>logout</a></li>");
} else {
	$("#nav #logout").addClass("hidden");
}

//	NAVIGATION	
$("#logout").on("click", function(){
	window.location = "/logout/";
});
$(".grocery_history").on("click", function(){
	window.location = "/grocery_history";
});
$(".grocery_shoplist").on("click", function(){
	window.location = "/grocery_checkout";
});
$("#alcohol-buttons input").on("click", function(){
	window.location = "/alcohol_history";
});
$(".alcohol_shoplist").on("click", function(){
	window.location = "/alcohol_checkout";
});
$(".home-grocery").on("click", function(){
	window.location = "/grocery";
});
$(".home-alcohol").on("click", function(){
	window.location = "/alcohol";
});
$(".home-payment").on("click", function(){
	window.location = "/payment";
});


//	Set signup/login fields to a type
$("label").css("display", "inline");
$(".login").find("label").css("display", "none");

//	Edit button functionality
$(".menu-item-button .edit-button").on("click", function(e){	
	e.stopPropagation();
});

//	Update button functionality
$(".menu-item-button .update-button").on("click", function(e){
	e.stopPropagation();
});

//	Edit button functionality
$(".menu-item-button-collapsed .edit-button").on("click", function(e){	
	e.stopPropagation();
});

//	Update button functionality
$(".menu-item-button-collapsed .update-button").on("click", function(e){	
	e.stopPropagation();
});

//	MAIN AJAX CALL
//	This call gathers information based on the user, the current group, and populates the pages as such.
//	The data pulled is based on the group the member is in
var current_user_id = $("#getUsername").data("id") - 1;
var current_group_id;

//	Remove hidden class from content once page has loaded properly
if($(".container").hasClass("register")){
	$(".container").removeClass("hidden");
}
getUser(current_user_id).done(function(userResult){
	//	If the user has a group and has set the tax continue
	if(userResult["group_ID"] != null && userResult["tax"] != null){
		$(".button-create-group").val("Change Group Name");
		group_id = userResult["group_ID"];
		//	Set the group for the users dashboard
		getGroup(userResult["group_ID"]).done(function(groupResult){
			var group_name = groupResult["name"];
			$(".home-groups").find(".panel-content").after(
				'<li class="dashboard-panel-list home-active">'+group_name+'</li>'
			);
		});
		$(".button-leave-group").removeClass("hidden");

		// 	UPDATE ITEM MODAL
		$("#update-button").on("click", function(){
			var name = $("#modal2-item-name input").val();
			var quan = $("#modal2-item-quantity input").val();
			var item = $("#myModal2").data("id");
			var formData = '{"name": "'+name+'", "quantity": '+quan+'}';
			//	Update the items name and quantity using a PATCH request
			patchTable("item", item, formData);
			reloadTimer(1000);
		});

		//	ADD GROCERY/ALCOHOL ITEM MODAL
		$("#add-button").on("click", function(){
			var name = $("#modal-item-name input").val();
			var quan = $("#modal-item-quantity input").val();
			var category = 1;
			if($("#alcohol-main").length)
				category = 0;
			var user = $("#modal-user input").data("pk");
			var formData = '{"name": "'+name+'", "quantity": '+quan+', "listType": '+category+', "cu_ID": "/api/customUser/'+(user-1)+'/", "group_ID": '+group_id+'}';
			$.ajax({
				type: "POST",
				url: "/api/item/",
				data: formData,
				dataType: "json",
				contentType : "application/json",
				complete: reload()
			});
		});

		//	HISTORY
		if($(".container").hasClass("grocery-history") || $(".container").hasClass("alcohol-history")){
			var category = "";
			if($(".container").hasClass("grocery-history")) category = "grocery";
			else category = "alcohol";
			$.ajax({
				type: "GET",
				url: "/api/"+category+"History/?group_ID__iexact="+group_id,
				dataType: "json",
				contentType : "application/json",
				success: function(historyResult){
					if(historyResult["objects"].length == 0) bind();
					$.each(historyResult["objects"], function(key, value){
						$.ajax({
							type: "GET",
							url: "/api/customUser/"+value["purchaser"],
							dataType: "json",
							contentType : "application/json",
							success: function(purchaserResult){
								$.ajax({
									type: "GET",
									url: "/api/customUser/"+value["requester"],
									dataType: "json",
									contentType : "application/json",
									success: function(requesterResult){
										var date = new Date(parseInt(value["date"]) * 1000);
										var formattedDate = date.getUTCDate() + '/' + (date.getUTCMonth() + 1)+ '/' + date.getUTCFullYear();
										if(value["total"] == null) value["total"] = "0.00";
										$("#content-"+category+"-history").append(
											'<div class="menu-item" id="'+key+'" data-date="'+formattedDate+'" data-name="'+value["name"]+'" data-purchaser="'+purchaserResult["email"]+'" data-requester="'+requesterResult["email"]
											+'" data-quantity="'+value["quantity"]+'" data-price="'+value["price"]+'" data-total="'+value["total"]+'">'
								        	+'	<div class="basket-text"><p>'
								        	+'		<span class="segment-1" style="width: 200px; margin-left: 2px;">'+formattedDate+'</span>'
								        	+'		<span class="segment-2" style="width: 330px; margin-right: 20px">'+value["name"]+'</span>'
								        	+'		<span class="segment-3" style="width: 330px; margin-right: 20px">'+purchaserResult["email"]+'</span>'
								        	+'		<span class="segment-4" >$'+value["total"]+'</span>'
								        	+'	</p>'
								        	+'	</div>'
								    		+'</div>'
										);
										bind();
										// if(key == historyResult["objects"].length - 1) bind();
									}
								});
							}
						});
					});
				},
			});
		}

		var state_checker = 0;
		//	PAYMENT
		if($(".container").hasClass("payment_template") || $(".container").hasClass("dashboard")){
			//	Purchaser/Owe You
			var jankData = current_user_id + "&completed__exact=false";
			getTableField("payment", "payer_ID", jankData).done(function(paymentResult){
				if(paymentResult["objects"].length == 0){
					state_checker++;
					checkBind(state_checker);
					return;
				}
				else{
					$.each(paymentResult["objects"], function(key, value){
						getTable("customUser", value["payee_ID"]).done(function(userResult){
							var temp_user = userResult["email"];
							if($(".container").hasClass("dashboard")){
								$(".home-payment").find(".who-owe-you").after(
									'<span class="dashboard-panel-item" style="margin-left: 40px">'+temp_user
									+'</span><span style="float: right; margin-right: 20px">$'+value["amount"]+'</span><br>'
								);
							}
							else{
								$("#you-owe").find(".table").append(
									'<tr data-id="'+value["p_ID"]+'" data-paypal="'+userResult["pay_pal"]+'" >'
				   		 			+'<td class="email-user" style="width: 300px">'+temp_user+'</td>'
									+'<td class="user-amount">$'+value["amount"]+'</td>'
									+'<td><input type="button" class="button button-pay-user" value="Pay" style="width: 150px"></td>'
				   		 			+'</tr>'
								);
							}
							if(key == paymentResult["objects"].length - 1) {
								state_checker++;
								checkBind(state_checker);
							}
						});
					});
				}
			});

			//	You Owe
			var jankData = current_user_id + "&completed__exact=false";
			getTableField("payment", "payee_ID", jankData).done(function(paymentResult){
				if(paymentResult["objects"].length == 0){
					state_checker++;
					checkBind(state_checker);
					return;
				}
				else{
					$.each(paymentResult["objects"], function(key, value){
						getTable("customUser", value["payer_ID"]).done(function(userResult){
							var temp_user = userResult["email"];
							if($(".container").hasClass("dashboard")){
								$(".home-payment").find(".who-you-owe").after(
									'<span class="dashboard-panel-item" style="margin-left: 40px">'+temp_user
									+'</span><span style="float: right; margin-right: 20px">$'+value["amount"]+'</span><br>'
								);
							}
							else{
								$("#owe-you").find(".table").append(
									'<tr data-id="'+value["p_ID"]+'" >'
				   		 			+'<td class="email-user" style="width: 300px">'+temp_user+'</td>'
									+'<td class="user-amount">$'+value["amount"]+'</td>'
									+'<td><input type="button" class="button button-edit-amount" value="Edit" style="width: 150px"></td>'
				   		 			+'</tr>'
								);
							}
							if(key == paymentResult["objects"].length - 1) {
								state_checker++;
								checkBind(state_checker);
							}
						});
					});
				}
			});
		}

		//	SHOW ITEMS
		if($(".container").hasClass("dashboard") || $(".container").hasClass("grocery") || $(".container").hasClass("grocery-checkout") || $(".container").hasClass("alcohol") || $(".container").hasClass("alcohol-checkout")){
			$.ajax({
				type: "GET",
				url: "/api/item/?group_ID__iexact="+group_id,
				dataType: "json",
				contentType : "application/json",
				success: function(itemData){
					if(itemData["objects"].length == 0 && !$(".container").hasClass("dashboard")) bind();
					var count = 0;
					$.each(itemData["objects"], function(key, value){
						if($(".container").hasClass("dashboard")){
							if(value["price"] == undefined) value["price"] = "0.00";
							if(value["cu_ID"]["cu_ID"] == current_user_id){
								if(count < 4){
									count++;
									if(value["listType"] == true){
					    				$(".home-grocery").find(".dashboard-panel-header").after(
						    				'<p class="dashboard-panel-item">'+value["name"]+'</p>'
							    		);
					    			}
					    			else {
							    		$(".home-alcohol").find(".dashboard-panel-header").after(
							    			'<p class="dashboard-panel-item">'+value["name"]+'</p>'
							    		);
							    	}
								}								
							}
						}
						var isHidden = "";
						if(value["cu_ID"]["cu_ID"] != current_user_id)
							isHidden = "hidden";
			    		//	GROCERY
						if(value["listType"] == true && $(".container").hasClass("grocery")){
							$("#grocery-main").find(".mybasket-content").append(
								'<div class="menu-item menu-item-activate" data-id="'+value["i_ID"]+'">'
								+ '<div class="basket-text"><p>'
								+ '<span class="segment-1" style="width: 450px; overflow: hidden">'+value["name"]+'</span>'
								+ '<span class="segment-2" style="width: 200px;">'+value["quantity"]+'</span>'
								+ '<span class="segment-3" style="max-width: 300px; width: 300px; overflow: hidden">'+value["cu_ID"]["email"]+'</span>'
								+ '</p></div>'
					        	+ '<div class="menu-item-button-collapsed">'
					            + '		<img src="/static/img/edit_button.png" class="edit-button '+isHidden+'">'
					            + '		<img src="/static/img/deleteIcon.png" class="segment-button-1 delete-button '+isHidden+'">'
					        	+ '</div>'
								+ '<div class="menu-item-button hidden">'
								+ '		<input type="button" class="edit-button button" value="Edit">'
								+ '</div>'     
								+ '</div>'
							);
						}
						//	ALCOHOL
						else if(value["listType"] == false && $(".container").hasClass("alcohol")){
							//	Generate every alcohol item populated by the data from the ajax call
							$("#alcohol-main").find(".mybasket-content").append(
								'<div class="menu-item menu-item-activate" data-id="'+value["i_ID"]+'">'
								+ '<div class="basket-text"><p>'
								+ '<span class="segment-1" style="width: 450px; overflow: hidden">'+value["name"]+'</span>'
								+ '<span class="segment-2" style="width: 200px;">'+value["quantity"]+'</span>'
								+ '<span class="segment-3" style="max-width: 300px; width: 300px; overflow: hidden">'+value["cu_ID"]["email"]+'</span>'
								+ '</p></div>'
					        	+ '<div class="menu-item-button-collapsed">'
					            + '		<img src="/static/img/edit_button.png" class="edit-button '+isHidden+'">'
					            + '		<img src="/static/img/deleteIcon.png" class="segment-button-1 delete-button '+isHidden+'">'
					        	+ '</div>'
								+ '<div class="menu-item-button hidden">'
								+ '		<input type="button" class="edit-button button" value="Edit">'
								+ '</div>'     
								+ '</div>'
							);
						}
						//	CHECKOUT GROCERY
						else if(value["listType"] == true && $(".container").hasClass("grocery-checkout")){
							//	Get the tax variable from the purchaser's customUser table
							// var tax = JSON.parse(dataUser["responseText"])["tax"]								
							var tax = userResult["tax"];
							var isOwner = "";
							if(value["price"] == null) value["price"] = "0.00";
							//	If the current user has items, disable the price field for the item so the user cannot owe themselves money
							if(current_user_id == value["cu_ID"]["cu_ID"])
								isOwner = "disabled";
							//	Generate every grocery checkout item populated by the data from the ajax call
							$(".grocery-checkout").find(".checkout-body").append(
								'<div class="menu-item menu-item-activate" data-id="'+value["i_ID"]+'">'
				        		+ '<div class="basket-text"><p>'
				        		+ '	<input class="checkbox" type="checkbox" style="margin: 10px; float: left">'
				        		+ '	<span class="segment-1" style="width: 300px; margin-left: 50px;">'+value["name"]+'</span>'
				        		+ '	<span class="segment-2" style="width: 200px; margin-left: 5px;"><input class="form-control checkout-quan" style="width: 100px" data-quan="'+value["quantity"]+'" value="'+value["quantity"]+'"></span>'
				        		+ '	<span class="segment-3" data-id="'+value["cu_ID"]["cu_ID"]+'" style="margin-right: 20px; max-width: 330px; width: 330px; overflow: hidden">'+value["cu_ID"]["email"]+'</span>'
				        		+ '	<span class="segment-4"><span style="float: left; margin-right: 5px;">$ </span><input class="form-control checkout-price" '+isOwner+' data-tax="'+tax+'" value="'+value["price"]+'" maxlength="6" style="width: 100px"></span>'
				        		+ '</p></div>'
				    			+ '</div>'
				    		);
				    		$(".checkout-button").removeClass("hidden")
						}
						//	CHECKOUT ALCOHOL
						else if(value["listType"] == false && $(".container").hasClass("alcohol-checkout")){
							//	Get the tax variable from the purchaser's customUser table
							var tax = userResult["tax"];
							var isOwner = "";
							if(value["price"] == null) value["price"] = "0.00";
							//	If the current user has items, disable the price field for the item so the user cannot owe themselves money
							if(current_user_id == value["cu_ID"]["cu_ID"])
								isOwner = "disabled";
							//	Generate every alcohol checkout item populated by the data from the ajax call
							$(".alcohol-checkout").find(".checkout-body").append(
								'<div class="menu-item menu-item-activate" data-id="'+value["i_ID"]+'">'
				        		+ '<div class="basket-text"><p>'
				        		+ '	<input class="checkbox" type="checkbox" style="margin: 10px; float: left">'
				        		+ '	<span class="segment-1" style="width: 300px; margin-left: 50px;">'+value["name"]+'</span>'
				        		+ '	<span class="segment-2" style="width: 200px; margin-left: 5px;"><input class="form-control checkout-quan" style="width: 100px" data-quan="'+value["quantity"]+'" value="'+value["quantity"]+'"></span>'
				        		+ '	<span class="segment-3" data-id="'+value["cu_ID"]["cu_ID"]+'" style="margin-right: 20px; max-width: 330px; width: 330px;">'+value["cu_ID"]["email"]+'</span>'
				        		+ '	<span class="segment-4"><span style="float: left; margin-right: 5px;">$ </span><input class="form-control checkout-price" '+isOwner+' data-tax="'+tax+'" value="'+value["price"]+'" maxlength="6" style="width: 100px"></span>'
				        		+ '</p></div>'
				    			+ '</div>'
				    		);
				    		$(".checkout-button").removeClass("hidden")
						}
						//	Call bind to initiate JS code after items have been added by JS
						if(itemData["objects"].length -1 == key) bind();
					});
				}
			});
		}
	}
	else{
		//	Redirect the user to the settings page if they are not on the dashboard or settings page
		if(window.location.href != "http://107.170.86.88/settings/")
			window.location.replace("/settings");
		//	Remove feilds that need the user to have a group and a tax percentage set
		$("#invite-user").addClass("hidden");
		$("#change-currency").addClass("hidden");
		$(".modal-title").text("Welcome to EvenUp!");
		$(".group-modal-message").css("font-size","14pt");
		$(".group-modal-message").text("To get started, you will need to create a group or be invited to a group.");
		$(".group-modal-message").append("<br>Once you have a group, you will need to set the tax percentage based on where you live.");
		$(".group-modal-message").append("<br><br>If you need any help just flail violently until you succumb to the dizziness!");
		$("#modalSettings").modal();
		bind();
	}
	//	SETTINGS
	if($(".container").hasClass("settings")){
		//	Tax
		$("#tax option").each(function(){
			if(this.value != parseInt(userResult["tax"])) return;
			else
				$("#tax option[value="+this.value+"]").attr('selected','selected');
		});
		//	Paypal
		$("#paypal-email").val(userResult["pay_pal"]);
		//	Currency
		getGroup(userResult["group_ID"]).done(function(groupResult){
			$("#group-name").val(groupResult["name"]);
			var group_currency = groupResult["currency"];
			$("#currency option").each(function(){
				if(this.value != group_currency) return;
				else
					$("#currency option[value="+this.value+"]").attr('selected','selected');
				bind();
			});
		});
	}
});

//	CREATE GROUP
$(".button-create-group").on("click", function(){
	var group_name = $("#create-group").find(".form-control").val();
	var user = $("#group-name").data("pk") - 1;
	getTable("customUser", user).done(function(userResult){
		if(userResult["group_ID"] == null){
			var postData = '{"name": "'+group_name+'", "customusers": [{"customuser":"/api/customUser/'+user+'/"}]}';
    		$.ajax({
				type: "POST",
				url: "/api/group/",
				data: postData,
				dataType: "json",
				contentType : "application/json",
				complete: function(data){
					id = (data.getResponseHeader('Location')).split("group/")[1];
					id = id.substring(0, id.length - 1);
					var patchData = '{ "group_ID": '+id+' }';
					patchTable("customUser", user, patchData);
					reload();
				}
			});
		}
		else{
			var id = userResult["group_ID"];
			var patchData = '{ "name": "'+group_name+'" }';
			patchTable("group", id, patchData);
			reload();
		}
	});
});

//	TAX
$(".button-change-tax").on("click", function(){
	var tax = $("#tax").val();
	var user = $("#getUsername").data("id") -1;
    var patchData = '{"tax": '+tax+'}';
    patchTable("customUser", user, patchData);
    $(".modal-title").text("Tax Updated");
	$(".group-modal-message").text("Tax Successfully Updated");
	$("#modalSettings").modal();
});

//	PAYPAL EMIAL
$(".button-change-paypal").on("click", function(){
	var paypal = $("#paypal-email").val();
	var user_id = $("#getUsername").data("id") - 1;
	var patchData = '{ "pay_pal": "'+paypal+'" }';
	$.ajax({
		type: "PATCH",
		url: "/api/customUser/"+user_id,
		data: patchData,
		dataType: "json",
		contentType : "application/json",
		complete: function(){
			$(".modal-title").text("Paypal Updated");
			$(".group-modal-message").text("Paypal Email Successfully Updated");
			$("#modalSettings").modal();
		}
	});
});

//	PAYPAL SUCCESS
if($(".container").hasClass("paypal-success")){
	var params = (window.location.href).split("p_id=")[1];
	params = params.split("&amount=");
	var id = params[0];
	var amount = parseFloat(params[1]);
	getTable("payment", id).done(function(paymentResult){
		var oldAmount = parseFloat(paymentResult["amount"]);
		var newAmount = oldAmount - amount;
		if(amount < oldAmount){
			var patchData = '{ "amount": "'+newAmount+'" }';
			patchTable("payment", id, patchData);
			reloadTimerUrl(400, "/payment");
		}
		else{
			deleteTable("payment", id);
			reloadTimerUrl(400, "/payment");
		}
	});
}

//	INVITE TO GROUP
$("#invite-user .button").on("click", function(){
	var selected_user = $("#invited-user").val();
	var user_id = $("#getUsername").data("id") -1;
	var selected_user_id;
	var group_id;
	getUser(user_id).done(function(userResult){
		group_id = userResult["group_ID"];
		$.ajax({
			type: "GET",
			url: "/api/customUser/?email__iexact="+selected_user,
			dataType: "json",
			contentType : "application/json",
			success: function(data){
				var str = data["objects"];
				if(data["objects"].length == 0){
					$(".modal-title").text("Invite Failed");
					$(".group-modal-message").text("User could not be found");
					$("#modalSettings").modal();
					$("#invited-user").val("");
				}
				else{
					selected_user_id = parseInt(str[0]["cu_ID"]);
					var postData = '{ "group_ID": '+group_id+', "inviter_ID": '+user_id+', "invitee_ID": '+selected_user_id+' }';
					$.ajax({
						type: "POST",
						url: "/api/invitation/",
						dataType: "json",
						contentType : "application/json",
						data: postData,
						complete: function(){
							$(".modal-title").text("User Invited to Group");
							$(".group-modal-message").text("User Successfully Invited to Group");
							$("#modalSettings").modal();
							$("#invited-user").val("");
						}
					});
				}
			}
		});
	});
});

//	INVITATIONS
$.ajax({
	type: "GET",
	url: "/api/invitation/?invitee_ID__exact="+current_user_id,
	dataType: "json",
	contentType : "application/json",
	success: function(data){
		$.each(data["objects"], function(key, value){
			var inv_id = value["inv_ID"];
			$.ajax({
				type: "GET",
				url: "/api/customUser/?cu_ID__iexact="+value["inviter_ID"],
				dataType: "json",
				contentType : "application/json",
				success: function(userResult){
					var inviter = userResult["objects"][0]["email"];
					$.ajax({
					type: "GET",
					url: "/api/group/?g_ID__iexact="+value["group_ID"],
					dataType: "json",
					contentType : "application/json",
					success: function(groupResult){
						var group = groupResult["objects"][0];
						var top = (key *  280) + 100;
						$("body").append(
							'<div class="invitation" style="top: '+top+'px" data-group-id="'+group["g_ID"]+'" data-invite-id="'+inv_id+'" ><h2 class="panel-heading" style="margin-top: 0px">Invitation</h2>'
							+'<p style="padding: 15px">'+inviter+' has invited your to the group '+group["name"]+'. Would you like to join?</p>'
							+'<div style="padding-bottom: 15px"><center><button class="btn btn-success button-accept-invite" style="margin-right: 5px">Accept</button>'
							+'<button class="btn btn-danger button-decline-invite">Decline</button></center></div></div>'
						);
						if(key == data["objects"].length - 1 ) bindInvites();
					}
				});
				}
			});
		});
	},
	error: function(x,y,z){
		console.log("No active invites");
	}	
});

//	CURRENCY
$(".button-change-currency").on("click", function(){
	var user_id = $("#getUsername").data("id") - 1;
	getUser(user_id).done(function(userResult){
		var currency = $("#currency :selected").val();
		var group_id = result["group_ID"];
		var patchData = '{"currency": "'+currency+'"}';
		$.ajax({
			type: "PATCH",
			url: "/api/group/"+group_id,
			data: patchData,
			dataType: "json",
			contentType : "application/json",
			complete: function(){
				$(".modal-title").text("Currency Updated");
				$(".group-modal-message").text("Desired Currency Was Successfully Updated");
				$("#modalSettings").modal();
			}
		});
	});
});

//	LEAVE GROUP
$(".button-leave-group").on("click", function(){
	$("#modal-generic").find(".modal-title").text("Leave Group");
	$("#modal-generic").find(".modal-message").text("Are you sure you want to leave your current group?");
	$("#modal-generic").find(".modal-footer button").attr("id", "modal-button-leave-group");
	$("#modal-generic").find(".modal-footer").append('<button type="button" class="btn btn-danger" data-dismiss="modal" style="width: 100px">Cancel</button>');
	$("#modal-generic").modal();
	bindSettings();
});

//	SUCCESS
//	On successfully creating a user, give data to custom_user
if($("#janks-ville").length){
	$(document).ready(function(){
		var user = $("#userID").data("pk");
		var email = $("#userID").data("email");
		var formData = '{ "u_ID": "/api/user/'+user+'/", "email": "'+email+'"}';
		$.ajax({
			type: "POST",
			url: "/api/customUser/",
			data: formData,
			dataType: "json",
			contentType : "application/json"
		});
	});
	var user = $("#userID").data("pk");
	setTimeout(function(){
	    window.location = "/";
	}, 1000);
}

// 	MOBILE CHANGES
//	This implements all changes to the page to make the website mobile friendly


var last_id = null;
var this_id = null;
var in_use = 0;
var start_timer = 0;
//	This function allows the website to apply javascript code to any element that was created after page load.
//	Elements such as any item created from an ajax call, will not recieve the inital load of the JS file.
function bind(){
	//	Edit Button Grocery/alcohol
	$(".edit-button").on("click", function(){
		$("#myModal2").modal();
		$("#modal2-item-name input").val($(this).parent().parent().find(".segment-1").text());
		$("#modal2-item-quantity input").val($(this).parent().parent().find(".segment-2").text());
		var item_id = $(this).parent().parent().data("id");
		$("#myModal2").data("id", item_id);
	});

	//	CHECKOUT
	$(".checkbox").on("click", function(e){
		e.stopPropagation();
	});
	$(".checkout-body").find(".menu-item").on("click", function(){
		if($(this).find(".checkbox").prop("checked")){
			$(this).find(".checkbox").prop("checked", false);
		}else{
			$(this).find(".checkbox").prop("checked", true);
		}
	});

	$(".grocery-history").css("height", $(window).height() - ($(window).height() * 0.1));

	//	CHECKOUT BUTTON
	$(".checkout-button").on("click", function(){
		var selected_length = 0;
		$.each($(".menu-item"), function(key, value){
			if($(value).find(".checkbox").is(":checked")){
				selected_length++;
				if($(value).find(".checkbox").length == selected_length)
					reloadTimer(1500);
				var deleted_id 	= $(value).data("id");
				var payee 		= $("#getUsername").data("id") - 1;
				var quantity 	= parseInt($(this).find(".segment-2 input").val());
				var name 		= $(this).find(".segment-1").text();
				var payer 		= $(this).find(".segment-3 ").data("id");
				var amount 		= $(this).find(".segment-4 input").val();
				var tax 		= parseFloat($(this).find(".segment-4 input").data("tax"));
				var subTotal 	= amount;
				var category 	= "";
				var date 		= Math.floor(Date.now() / 1000);
				amount *= quantity;
				amount *= ((tax / 100) + 1);
				amount = Math.round(amount * 100) / 100;
				//	Get items
				getTable("item", deleted_id).done(function(itemResult){
					//	Set the category
					if($(".container").hasClass("grocery-checkout")) category = "grocery";
					else category = "alcohol";
					//	History data for post
					var postData = '{ "date": "'+date+'", "name": "'+name+'", "quantity": '+quantity+', "price": '+subTotal+', "group_ID": '+itemResult["group_ID"]+', "requester": '+payer+', "purchaser": '+payee+', "total": "'+amount+'" }';
					var tableName 	= category+"History";
					postTable(tableName, postData);
					if(quantity >= itemResult["quantity"]){
						deleteTable("item", deleted_id);
						console.log("First");
					}
					else{
						//	Set the new quantity
						var newQuantity = itemResult["quantity"] - quantity;
						var patchData = '{ "quantity": '+newQuantity+' }';
						//	Patch the new amount in the item
						patchTable("item", deleted_id, patchData);
						console.log("Second");
					}
					if(payee != payer){
						//	Get Payments of payee/purchaser
						getTableField("payment", "payee_ID", payee).done(function(paymentResult){
							//	If there are no records for the payee/purchaser
							if(paymentResult["objects"].length == 0){
								var postData = '{ "payee_ID": '+payee+', "payer_ID": '+payer+', "amount": "'+amount+'" }';
								postTable("payment", postData);
								console.log("Third");
							}
							else {
								var match = false;
								//	Iterate all users payment records where they are the payee/purchaser
								$.each(paymentResult["objects"], function(k, value){
									if(value["payee_ID"] == payee && value["payer_ID"] == payer){
										match = true;
										var newAmount = amount + parseFloat(value["amount"]);
										var patchData = '{ "amount": '+newAmount+' }';
										patchTable("payment", value["p_ID"], patchData);
										console.log("Fourth");
									}
									if(k == paymentResult["objects"] - 1 && match == false){
										var postData = '{ "payee_ID": '+payee+', "payer_ID": '+payer+', "amount": "'+amount+'" }';
										postTable("payment", postData);
										console.log("Fifth");
									}
								});
							}
						});
					}
				});
			}
			// $("#modal-generic").find(".modal-title").text("Checked Out");
			// $("#modal-generic").find(".modal-message").text("Selected items were removed from the list");
			// $("#modal-generic").find(".modal-footer").find(".button").attr("onclick", "reload()");
			// $("#modal-generic").modal();
		});
	});

	//	Input validation and formatting for the pice field
	$(".checkout-price").keydown(function(event) {
		// if(isNan($(".checkout-price").val())) $(".checkout-price").val(0);
		if(event.which < 8 || (event.which > 8 && event.which < 37) || (event.which > 40 && event.which < 48) || event.which > 57 )	return false;
		if((event.which >= 37 && event.which <= 40) || event.which == 8){ }
		else {
			// format number
		  	$(this).val(function(index, value) {
		  		var str = value;
		  		if(str == "0.00" || str == "0.0" || str == "0." || str == "0")
		  			str = "";
		  		if(str.indexOf('.') > -1)
		  			str = str.replace('.', "");
		  		str = str.substring(0,str.length-1)+"."+str.substring(str.length-1);
		    	return str;
			});
		}
	});

	//	DELETE ITEM
	$(".delete-button").on("click", function(){
		var deleted_id = $(this).parent().parent().data("id");
		$.ajax({
			type: "DELETE",
			url: "/api/item/"+deleted_id,
			dataType: "json",
			contentType: "application/json",
			complete: reload()
		});
	});

	//	PAYMENT
	$(".button-pay-user").on("click", function(){
		$("#payment-form").removeClass("hidden");
		var amount = $(this).parent().parent().find(".user-amount").text().substring(1);
		var email = "";
		if($(this).parent().parent().data("paypal") == null)
			email = $(this).parent().parent().find(".email-user").text();
		else
			email = $(this).parent().parent().data("paypal");
		var payment_id = $(this).parent().parent().data("id");
		$("#payment-id").val(payment_id);
		$("#amount").val(amount);
		$("#email-payee").val(email);
	});

	//	EDIT ITEM
	$(".button-edit-amount").on("click", function(){
		var id = $(this).parent().parent().data("id");
		var amount = $(this).parent().parent().find(".user-amount").text().substring(1);
		$(".amount-value").val(amount);
		$("#modalPayment").modal();
		$("#modalPayment").data("id", id);
	});

	//	EDIT AMOUNT OWED
	$(".button-change-payment").on("click", function(e){
		var formData = '{ "amount": '+parseFloat($(".amount-value").val())+' }';
		$.ajax({
			type: "PATCH",
			dataType: "json",
			contentType : "application/json",
			url: "/api/payment/"+$("#modalPayment").data("id"),
			data: formData,
			complete: reload()
		});
	});

	//	PAY USER
	$("#button-payment").on("click", function(e){
		e.preventDefault();
		var user_id = $("#getUsername").data("id") - 1;
		$.ajax({
			type: "GET",
			dataType: "json",
			contentType : "application/json",
			url: "/api/customUser/"+user_id,
			success: function(data){
				var email = data["pay_pal"];
				$.ajax({
					type: "GET",
					dataType: "json",
					contentType : "application/json",
					url: "/api/group/"+data["group_ID"],
					success: function(data){
						var amount = $("#amount").val();
						var currency = data["currency"];
						var payment_id = $("#payment-id").val();
					 	// var data = '{"actionType":"PAY","currencyCode": "'+currency+'","receiverList":{"receiver":[{"amount":"'+amount+'","email":"'+email+'", "paymentType":"PERSONAL"}]},"returnUrl":"https://google.ca", "cancelUrl":"https://yahoo.com","requestEnvelope":{"errorLanguage":"en_US","detailLevel":"ReturnAll"}}'
						var data = '{"actionType":"PAY","currencyCode": "'+currency+'","receiverList":{"receiver":[{"amount":"'+amount+'","email":"'+email+'", "paymentType":"PERSONAL"}]},"returnUrl":"http://107.170.86.88/paymentSuccess/?p_id='+payment_id+'&amount='+amount+'", "cancelUrl":"http://107.170.86.88/payment","requestEnvelope":{"errorLanguage":"en_US","detailLevel":"ReturnAll"}}'
						$.ajax({
							type: 'POST',
					        url: 'https://svcs.sandbox.paypal.com/AdaptivePayments/Pay/',
					        headers: {
					        	'Access-Control-Allow-Origin': '*',
					        	'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
					        	'Access-Control-Allow-Credentials': 'true',
								'X-PAYPAL-SECURITY-USERID' : 'rmolgat_api1.gmail.com',
								'X-PAYPAL-SECURITY-PASSWORD' : 'B3XKDKLLT2TGE4NW',
								'X-PAYPAL-SECURITY-SIGNATURE' : 'AFcWxV21C7fd0v3bYYYRCpSSRl31A2phgifvWKKMrQ-QU7CMMCdlap.6',
								'X-PAYPAL-APPLICATION-ID' : 'APP-80W284485P519543T',
								'X-PAYPAL-REQUEST-DATA-FORMAT' : 'JSON',
								'X-PAYPAL-RESPONSE-DATA-FORMAT' : 'JSON'
							},
					        data: data,
					        dataType: "json",
							contentType : "application/json",
							success: function(result){
								key = result["payKey"];
								$("#payment-form").addClass("hidden");
								location.replace("https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_ap-payment&paykey="+key);
							}
						});
					}
				});
			}
		});	
	});

	//	HISTORY MENU ITEM CLICk
	$(".history").find(".menu-item").on("click", function(){
		var this_id = $(this).attr("id");
		//	If already open, close
		if($(this).hasClass("menu-item-active")){
			if(in_use == 1) return false;
			in_use = 1;
			$(this).removeClass("menu-item-active");
			$(this).find("span").removeClass("hidden");
			$(this).find(".checkout-table").remove();
			$(this).find("span").animate({"opacity": "1"});
			$(this).animate({
				"height": "68px"
			}, function(){
				in_use = 0;
			});
			var temp = this_id;
		}
		//	If already closed, open
		else {
			if(in_use == 1) return false;
			in_use = 1;
			$(this).addClass("menu-item-active");
			$(this).find("span").animate({"opacity": "0"});
			$(this).animate({
				"height": "165px"
			}, function(){
				$(this).find("span").addClass("hidden");
				$(this).append('<center><table class="checkout-table">'
					+'<tr><td>Date:</td> 		<td>'+$(this).data("date")+'</td>'
					+'<td>Name:</td> 			<td>'+$(this).data("name")+'</td></tr>'
					+'<tr><td>Purchaser:</td>	<td>'+$(this).data("purchaser")+'</td>'
					+'<td>Requester:</td>		<td>'+$(this).data("requester")+'</td></tr>'
					+'<tr><td>Quantity: </td> 	<td>'+$(this).data("quantity")+'</td>'
					+'<td>Price:</td> 			<td>$'+$(this).data("price")+'</td></tr>'
					+'<tr><td>Total Cost:</td> 	<td>$'+$(this).data("total")+'</td></tr></table></center>');
				in_use = 0;
			});
		}
		//	If another is selected while existing active, close existing
		if(this_id != last_id){
			in_use = 1;
			$("#"+last_id).removeClass("menu-item-active");
			$("#"+last_id).find("span").removeClass("hidden");
			$("#"+last_id).find(".checkout-table").remove();
			$("#"+last_id).find("span").animate({"opacity": "1"});
			$("#"+last_id).animate({
				"height": "68px"
			}, function(){
				in_use = 0;
			});
			var temp = last_id;
		}
		last_id = $(this).attr("id");
	});

	//	This is the code for clicking on a list item and having the item expand with more information. Currently disabled for the full web version

	$(".menu-item-activate").on("click", function(){
	  // Check code to see if element is currently in animation, if yes do not allow other menu items to be clicked
		this_id = $(this).attr("id");
		  // SELF CLOSE
	 	if($(this).hasClass("menu-item-activate")){
		  	if(in_use == 1) return false;
		   		in_use = 1;
		   	if(mobile_state == 1){
		    	$(this).removeClass("menu-item-activate");
		    	$(this).animate({"height": "68px"}, 400,function(){in_use = 0});
		    	$(this).find("p").css({"width": "70%", "white-space": "nowrap"});
		    	$(this).find(".segment-2").addClass("hidden");
		    	$(this).find(".segment-3").addClass("hidden");
		   		$(this).find(".segment-4").addClass("hidden");
		    	$(this).find(".menu-item-button-collapsed").addClass("hidden");
		   	}
	  	}
		  // OPEN
		else {
		   if(in_use == 1) {
		    	return false;
		    }
		   	in_use = 1;
		   	$(this).addClass("menu-item-activate");
		   	if(mobile_state == 1){
		   		$(this).animate({"height": "150px"}, 400,function(){in_use = 0});
		   		$(this).find("p").css({"width": "80%", "white-space": "normal"});
		   		$(this).find(".segment-2").removeClass("hidden");
		   		$(this).find(".segment-3").removeClass("hidden");
		   		$(this).find(".segment-4").removeClass("hidden");
		   		$(this).find(".menu-item-button-collapsed").removeClass("hidden");
		   		$(this).find(".basket-text p").css("height", "80%");
		   	}
		}
		  // SECONDARY CLOSE
	  	if(this_id != last_id){
		   	in_use = 1;
		   	if(mobile_state == 1){
		   		$("#"+last_id).removeClass("menu-item-activate");
		    	$("#"+last_id).animate({"height": "68px"}, 400,function(){in_use = 0});
		    	$("#"+last_id).find("p").css({"width": "70%", "white-space": "nowrap"});
		    	$("#"+last_id).find(".segment-2").addClass("hidden");
		    	$("#"+last_id).find(".segment-3").addClass("hidden");
		    	$("#"+last_id).find(".segment-4").addClass("hidden");
		    	$("#"+last_id).find(".menu-item-button-collapsed").addClass("hidden");
		   	}
		   	var temp = last_id
	  	}
		last_id = $(this).attr("id");
	});
 	$(".container").removeClass("hidden");
 	mobile();
 	console.log("Bind");
}

function bindInvites(){
	console.log("Bind invites");
	//	Accept invitation
	$(".button-accept-invite").on("click", function(){
		var user_id = $("#getUsername").data("id") - 1;
		var invite_id = $(this).parent().parent().parent().data("invite-id");
		var group_id = $(this).parent().parent().parent().data("group-id");
		var patchData = '{ "group_ID": '+group_id+' }';
		console.log(patchData);
		patchTable("customUser", user_id, patchData);
		deleteTable("invitation", invite_id);
		reloadTimer(1000);
	});
	//	Decline invitation
	$(".button-decline-invite").on("click", function(){
		var invite_id = $(this).parent().parent().parent().data("invite-id");
		var thisButton = $(this);
		deleteTable("invitation", invite_id);
	});
}

function bindSettings(){
	//	Leave group modal confirm
	$("#modal-button-leave-group").on("click", function(){
		console.log("leaving group");
		var id = $("#getUsername").data("id") -1;
		var patchData = '{ "group_ID": '+null+'}';
		patchTable("customUser", id, patchData);
		reload();
	});
}

//	Generic AJAX calls
function getTable(table, id){
	var data = $.ajax({
		type: "GET",
		url: "/api/"+table+"/"+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function getTableField(table, field, id){
	var data = $.ajax({
		type: "GET",
		url: "/api/"+table+"/?"+field+"__iexact="+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function postTable(table, postData){
	$.ajax({
		type: "POST",
		url: "/api/"+table+"/",
		dataType: "json",
		contentType : "application/json",
		data: postData
	});
	return;
}

function patchTable(table, id, patchData){
	$.ajax({
		type: "PATCH",
		url: "/api/"+table+"/"+id,
		dataType: "json",
		contentType : "application/json",
		data: patchData
	});
	return;
}

function deleteTable(table, id){
	$.ajax({
		type: "DELETE",
		url: "/api/"+table+"/"+id,
		dataType: "json",
		contentType : "application/json"
	});
	return;
}

// Depricated AJAX calls

function getUser(id){
	var data = $.ajax({
		type: "GET",
		url: "/api/customUser/"+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function getItem(id){
	var data = $.ajax({
		type: "GET",
		url: "/api/item/"+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function getGroup(id){
	var data = $.ajax({
		type: "GET",
		url: "/api/group/"+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function getGroupField(id, field){
	var data = $.ajax({
		type: "GET",
		url: "/api/payment/?"+field+"__iexact="+id,
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function getPayment(id){
	var data = $.ajax({
		type: "GET",
		url: "/api/payment/id",
		dataType: "json",
		contentType : "application/json"
	});
	return data;
}

function checkBind(state_checker){
	if(parseInt(state_checker) > 1) bind();
}

function mobile(){
	//	Design menu for mobile
	if(screen.width < 680 || $("#nav").width() < 640 && mobile_state == false){
		mobile_state = true;
		var menu_state = 0;
		$("#nav .submenu").hide();
		// $(".signupSection").toggleClass("hidden");
		if($(".menu_dashes").length == 0){
			$("#nav .nav_title a").append("<img src='../static/img/dashes.png' class='menu_dashes'>");
		}
		$("#nav span").hide();
		$("#nav .nav_title img").on("click", function(e){
			e.preventDefault();	
			if(menu_state == 0){
				$("#nav .submenu").show();
				$("#nav").animate({'height': '270px'}, 400);
				menu_state = 1;
			} else {
				$("#nav .submenu").hide();
				$("#nav").animate({'height': '70px'}, 400);
				menu_state = 0;
			}
		});

		$(".menu-item p").css({"width": "70%", "padding-top": "5px", "overflow": "hidden", "white-space": "nowrap"});
		$(".menu-item .menu-item-button-collapsed").css("padding-right", "0px");

		//	ALL

		// DASHBOARD
		$(".home-panel").removeClass("left").removeClass("right").addClass("center");
		$(".home-panel").css("height", "100%");
		$(".home-panel p").css("font-size", "14pt");
		$(".home-panel li").css("font-size", "14pt");

		//	GROCERY/ALCOHOL
		// $(".menu-header").addClass("hidden");
		// $(".segment-2").addClass("hidden");
		// $(".segment-3").addClass("hidden");
		// $(".segment-4").addClass("hidden");
		// $("span").css("font-size", "14pt");
		// $(".menu-item span").css({
		// 	"margin-bottom": "5px"
		// });	
		// $(".modal-body input").css("width", "100%");
		// $(".modal-label").css("width", "120px");

		// GROCERY/ALCOHOL
		$(".menu-header").addClass("hidden");
		$(".segment-2").addClass("hidden");
		$(".segment-3").addClass("hidden");
		$(".segment-4").addClass("hidden");
		$(".menu-item-button-collapsed").addClass("hidden");
		$("span").css("font-size", "14pt");
		$(".menu-item span").css({
		"margin-bottom": "5px"
		}); 
		$(".modal-body input").css("width", "100%");
		$(".modal-label").css("width", "120px");

		//	CHECKOUT
		$(".checkout-content").find(".segment-1").css({
			"width": "60%"
			, "margin-left": "10px"
			, "margin-top": "8px"
		});
		$(".checkout-content").find(".checkout-button").css("width", "88%");

		//	SETTINGS
		$(".group-settings").find(".form-control").css("margin-bottom", "5px");

	} else {
		//	Navigation
		$("#nav .nav_title").on("click", function(){
			window.location = "/";
		});
		$("#nav #mybasket").on("click", function(){
			window.location = "/grocery";
		});
		$("#nav #wishlist").on("click", function(){
			window.location = "/alcohol";
		});
		$("#nav #settings").on("click", function(){
			window.location = "/settings";
		});
		$("#nav #signup").on("click", function(){
			window.location = "/register";
		});
		mobile_state = false;
	}
}

function reload(){
	location.reload();
}

function reloadTimer(time){
	setTimeout(function(){
		reload();
	}, time);
}

function reloadTimerUrl(time, url){
	setTimeout(function(){
		window.location(url);
	}, time);
}