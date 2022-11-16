var signalR = $.connection.notification;
(function () {
    setInterval(function () {
        $.ajax({
            url: '/ManagePR/reviveSession',
            type: 'GET',
            success: function (result) {
                console.log('revive session...');
                console.log(result.userID);
            },
            error: function (request, error) {
                alert(" Can't do because: " + error);
            }
        });
    }, 600000);

    // Defining a connection to the server hub.
    // Setting logging to true so that we can see whats happening in the browser console log. [OPTIONAL]
    $.connection.hub.logging = true;
    // Start the hub
    //$.connection.hub.start().done(function () {
    //    console.log('Connect! connection Id=' + $.connection.hub.id);
    //}).fail(function () {
    //    console.log('Could not Connect!');
    //});
    setInterval(function () {
        if ($.connection.hub && $.connection.hub.state === $.signalR.connectionState.disconnected) {
            $.connection.hub.start();
            console.log('connection started');
        }
    }, 500);

    setTimeout(function () {
        // Let's check if the browser supports notifications
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
        }
        // Otherwise, we need to ask the user for permission
        else if (Notification.permission === "default") {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    Push.create('PR System Notification', {
                        body: "You have successfully enabled notification.",
                        icon: '../../dist/img/user1-128x128.jpg',
                        timeout: 60000,
                        onClick: function () {
                            window.focus();
                            this.close();
                        }
                    });
                } else {
                    alert('kindly enable Notification in your browser settings...');
                }
            });
        } 
    }, 1000);
    
    // Client method to broadcast the message
    signalR.client.notify = function (message) {
        $(".dropdown-menu").html('');
        $.ajax({
            url: '/ManagePR/GetPRStatus',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                $(".lblpreparing").html(res.Preparing); // Preparing
                $(".lblOnProcess").html(res.OnProcessDivision); // On Process Division
                $(".lblreturned").html(res.Returned); // Returned
                $(".lblOnProcessOwner").html(res.OnProcess); // On Process
                $(".lblNotificationDivision").html(res.Returned);
                $(".lblforPO").html(res.ForPurchaseOrder);
                $(".lblorsdv").html(res.ForORSDV);
                //var music = document.getElementById("myAudio");
                //music.play();
            }, error: function (res) {
                alert(res.statusText + ", " + res.responseText);
            }
        });
    };

    signalR.client.message = function (message) {
        Swal.fire({
            title: 'Advisory',
            html: message,
            allowOutsideClick: false,
        })
    }

    signalR.client.sendNotification = function (message, officeID, divisionID) {
        if (parseInt($('#hidDivisionID').val()).toString() == parseInt(divisionID).toString()) {
            Notification.requestPermission().then(function (result) {
                if(result == "granted"){
                    Push.create('PR System Notification', {
                        body: message,
                        icon: '../../dist/img/user1-128x128.jpg',
                        timeout: 60000,
                        onClick: function () {
                            window.focus();
                            this.close();
                        }
                    });
                }else{

                }
            });

        }
    }

    signalR.client.clear = function (internval, message) {
        let timerInterval
        Swal.fire({
            title: 'PR System Auto Update!',
            html: 'Restarting in <b></b> </br>' + message,
            timer: internval,
            timerProgressBar: true,
            allowOutsideClick: false,
            backdrop: `
            rgba(255, 153, 10, 0.8)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
            `,
            onBeforeOpen: () => {
                Swal.showLoading()
                timerInterval = setInterval(() => {
                    const content = Swal.getContent()
                    if (content) {
                        const b = content.querySelector('b')
                        if (b) {
                            b.textContent = secondsToTime(Swal.getTimerLeft())
                        }
                    }
                }, 100)
            },
            onClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('I was closed by the timer');
                window.location.reload(true);
            }
        });
        //signalR.server.clearCache(interval, message);
    }
    
}());

function secondsToTime(secs) {
    return new Date(secs).toISOString().slice(11, -1);;
}

$(document).ready(function () {


    $.ajax({
        url: '/ManagePR/GetPRStatus',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            $(".lblpreparing").html(res.Preparing); // Preparing
            $(".lblOnProcess").html(res.OnProcessDivision); // On Process Division
            $(".lblreturned").html(res.Returned); // Returned
            $(".lblOnProcessOwner").html(res.OnProcess); // On Process
            $(".lblNotificationDivision").html(res.Returned);
            $(".lblforPO").html(res.ForPurchaseOrder);
            $(".lblorsdv").html(res.ForORSDV);
            //var music = document.getElementById("myAudio");
            //music.play();
        }, error: function (res) {
            alert(res.statusText + ", " + res.responseText);
        }
    });

    $('form').on('submit', function (e) {
        e.preventDefault();
        $("button[type='submit']").attr('disabled', true)
        Save(this, $(this).attr('action'));
    });

    $('#btnLogout').click(function () {
        var ctrl = this;
        Swal.fire({
            title: 'Prompt Message',
            text: "Are you sure to logout?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes'
        }).then((result) => {
            if (result.value) {
                //href = "~/User/Logout"
                window.location.href = $(ctrl).data('url');
            }
        })
    });
});



const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
});

/* Formatting function for row details - modify as you need */
function format(d) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">' +
               '<tr>' +
                   '<td>Division Name:</td>' +
                   '<td>' + d.DivisionName + '</td>' +
               '</tr>' +
               '<tr>' +
                   '<td>PR Number:</td>' +
                   '<td>' + (d.PRNumber == null? "" : d.PRNumber) + '</td>' +
               '</tr>' +
               '<tr>' +
                   '<td>PR Date:</td>' +
                   '<td>' + d.DatePRPrepared + '</td>' +
               '</tr>' +
           '</table>';

    var res = '';
}

function GetLogs(id) {
    $(".timeline").html('');
    $(".timeline").load("/ManagePR/GetLogs?PurchaseRequestID=" + id);
    $('#modal-logs').modal('show');
}

function Save(frm, url) {
    $("button[type='submit']").attr('disabled', true)
    $.ajax({
        url: url,
        data: $(frm).serialize(),
        type: 'POST',
        dataType: 'json',
        success: function (res) {
            if (res.success) {
                Swal.fire(
                      'Prompt Message',
                      res.message,
                      'success'
                );
                signalR.server.notifyUser()
            } else {
                Swal.fire(
                      'Prompt Message',
                      res.message,
                      'error'
                );
            }
            $('form').find('input:not(input[type=checkbox], input[type=radio]), textarea, select').val('');
            $('table').DataTable().ajax.reload();
            $('.modal').modal('hide');
            $("button[type='submit']").attr('disabled', false)
        }
        , error: function (res) {
            alert(res.statusText + ", " + res.responseText);
            $("button[type='submit']").attr('disabled', false)
        }
    });
}

function ActiveMenu(id) {
    var targetObj = $(id);

    setTimeout(function () {
        var currObj = targetObj;
        if (currObj.hasClass('nav-link')) {
            $('.nav-sidebar').find('.nav-link').removeClass('active');
            currObj.addClass('active');
        }

        while (!currObj.hasClass('nav-sidebar')) {
            if (currObj.hasClass('nav') && currObj.hasClass('nav-treeview')) {
                currObj.show();
            }
            if (currObj.hasClass('nav-item') && currObj.hasClass('has-treeview')) {
                $('.nav-sidebar').find('.menu-open').removeClass('menu-open');
                currObj.addClass('menu-open');
                $('.nav-sidebar').find('.menu-open a.parent').addClass("active")
            }
            currObj = currObj.parent();
        }
    }, 0);
}

function ActiveTab(navid, tabid) {
    var targetnavObj = $(navid);
    var targettabObj = $(tabid);

    setTimeout(function () {
        var currObj = targetnavObj;
        if (currObj.hasClass('nav-link')) {
            $('.nav-pills.course').find('.nav-link').removeClass('active');
            currObj.addClass('active');
        }
    }, 0);

    setTimeout(function () {
        var currObj = targettabObj;
        if (currObj.hasClass('tab-pane')) {
            $('.tab-content.course').find('.tab-pane.course').removeClass('active');
            currObj.addClass('active');
        }
    }, 0);
}


function parseAndResolve(json) {
    var refMap = {};

    return JSON.parse(json, function (key, value) {
        if (key === '$id') {
            refMap[value] = this;
            // return undefined so that the property is deleted
            return void (0);
        }

        if (value && value.$ref) {
            return refMap[value.$ref];
        }

        return value;
    });
}

function fnSupplytoFields(div, result, dto) {
    var data = parseAndResolve(result)[dto];
    fnLoadValue(div, data);
}

function fnLoadValue(div, data) {
    if (data != null)
        var textboxes = $(div).find("input[type=text], select, input[type=number], input[type=hidden], input[type=date],input[type=datetime-local], textarea, input[type=checkbox], input[type=radio]");

    $.each(textboxes, function (i, txt) {
        var name = $(txt).attr("name");
        var id = $(txt).attr("id");
        if (name == null)
            return;
        if (name == "")
            return;
        var objs = name.split(".");
        var value;
        for (var i = 0; i < objs.length; i++) {
            if (value == null) {
                if (data != null)
                    value = data[objs[i]];
            }
            else
                value = value[objs[i]];
        }

        if ($(txt).attr("type") == "date") {
            console.log(value);
            if (value != null)
                $(txt).val(ToHTML5DateFormat(value));
        }
        else if ($(txt).attr("type") == "radio") {
            if (value != null)
                if ($(txt).val() == value.toString())
                    $(txt).attr('checked', true).prop('checked', true)
        }
            //else if ($(txt).attr("type") == "radio") {
            //    $($('[name=' + name + ']')).attr('checked', false).prop('checked', false)
            //    $($('[name=' + name + ']')).each(function (i, rad) {
            //        if (value != null)
            //            if ($(rad).val() == value.toString())
            //                $(rad).attr('checked', true).prop('checked', true)
            //    });
            //}
        else if ($(txt).attr("type") == "checkbox") {
            if (value)
                $(txt).attr('checked', true).prop('checked', true);
            else
                $(txt).attr('checked', false).prop('checked', false);
        }
        else if ($(txt).hasClass("isDate")) {
            if (value != null) {

                $(txt).val(DateToCalendarFormat(value));
            }
        }
        else {
            $(txt).val(value);
            if ($(txt).hasClass('fileData')) {
                if (value != "" && value != null)
                    $(txt).parent().find('img').attr('src', '../DMS/DownloadFile?&fID=' + value + '&targetFolder=OPS');
            }
        }

    });

    var img = $(div + " img");
    $.each(img, function (i, img) {
        var name = $(img).attr("name");
        if (name == null)
            return;
        if (name == "")
            return;
        var objs = name.split(".");
        var value;
        for (var i = 0; i < objs.length; i++) {
            if (value == null) {
                if (data != null)
                    value = data[objs[i]];
            }
            else
                value = value[objs[i]];
        }
        if (value != "" && value != undefined && value != null)
            $(img).attr('src', '../DMS/DownloadFile?&fID=' + value + '&targetFolder=' + "OPS");
        else
            $(img).attr('src', '../Content/img/upload logo.png');
    });


    var cmbboxes = $(div + " select");
    $.each(cmbboxes, function (i, cmkbx) {
        var name = $(cmkbx).attr("name");
        if (name == null)
            return;
        if (name == "")
            return;
        var objs = name.split(".");
        var value;
        for (var i = 0; i < objs.length; i++) {
            if (value == null) {
                if (data != null)
                    value = data[objs[i]];
            }
            else
                value = value[objs[i]];
        }

        $(cmkbx).val(value);
    });
}

function ToHTML5DateFormat(dateStr) {

    var date = new Date(fnDateNumber(dateStr));
    var dd = date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString();
    var MM = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString();
    var dddd = date.getFullYear() + "-" + MM + "-" + dd;
    return dddd;
}

function fnDateNumber(data) {
    if (data !== undefined && data !== '' && data !== null && data != '<br/>') {
        var date = data.toString();
        if (data.indexOf('(') > 0) {
            var fdate = ((date).split('(')[1]).split(')')[0];
            return GetJSONDate(parseInt(fdate));
        } else {
            return data;
        }
    }
    return data;
}

function GetJSONDate(jsonDate) {
    if (jsonDate != null && jsonDate != "") {
        var date = new Date;
        if (jsonDate.length > 11)
            date = new Date(parseInt(jsonDate.substr(6, 13)));
        else
            date = new Date(parseInt(jsonDate));
        var dd = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        //var date = new Date(parseInt(jsonDate.substr(6, 13)));
        return (date.getMonth() + 1).toString() + "/" + dd + "/" + date.getFullYear();
    }
    return null;
}

$.fn.extractObject = function () {
    var accum = {};
    function add(accum, namev, value) {
        if (namev.length == 1)
            accum[namev[0]] = value;
        else {
            if (accum[namev[0]] == null)
                accum[namev[0]] = {};
            add(accum[namev[0]], namev.slice(1), value);
        }

    };
    this.find('input[type=hidden], input[type=number], input[type=date], input[type=text], input[type=email], input[type=radio]:checked, textarea, select, input[type=checkbox]').each(function () {
        if ($(this).attr('name') != null) {
            add(accum, $(this).attr('name').split('.'), $(this).val());
            if ($(this).attr('type') == 'checkbox') {
                add(accum, $(this).attr('name').split('.'), $(this).prop('checked'));
            }
        }
    });
    return accum;
};


$.fn.serializeObject = function () {

    var self = this,
        json = {},
        push_counters = {},
        patterns = {
            "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
            "key": /[a-zA-Z0-9_]+|(?=\[\])/g,
            "push": /^$/,
            "fixed": /^\d+$/,
            "named": /^[a-zA-Z0-9_]+$/
        };


    this.build = function (base, key, value) {
        base[key] = value;
        return base;
    };

    this.push_counter = function (key) {
        if (push_counters[key] === undefined) {
            push_counters[key] = 0;
        }
        return push_counters[key]++;
    };

    $.each($(this).serializeArray(), function () {

        // Skip invalid keys
        if (!patterns.validate.test(this.name)) {
            return;
        }

        var k,
            keys = this.name.match(patterns.key),
            merge = this.value,
            reverse_key = this.name;

        while ((k = keys.pop()) !== undefined) {

            // Adjust reverse_key
            reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

            // Push
            if (k.match(patterns.push)) {
                merge = self.build([], self.push_counter(reverse_key), merge);
            }

                // Fixed
            else if (k.match(patterns.fixed)) {
                merge = self.build([], k, merge);
            }

                // Named
            else if (k.match(patterns.named)) {
                merge = self.build({}, k, merge);
            }
        }

        json = $.extend(true, json, merge);
    });

    return json;
};

var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

function roundFloat(num, dec) {
    var d = 1;
    for (var i = 0; i < dec; i++) {
        d += "0";
    }
    return Math.round(num * d) / d;
}