$(document).ready(function () {
    $('#TBPurpose').keyup(function () {
        var obj = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            Purpose: $('#TBPurpose').val(),
            TransactionTypeID: $('#TransactionTypeID').val(),
            dt: dtGetPRs.rows().data()
        }
        StorePRDetail(obj)
    });

    $('#TransactionTypeID, #TBTotal').change(function () {
        var obj = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            Purpose: $('#TBPurpose').val(),
            TransactionTypeID: $('#TransactionTypeID').val(),
            dt: dtGetPRs.rows().data()
        }
        StorePRDetail(obj)
    });

    $('#TBDate').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' });
    $('#OfficeID, #StatusID').val(-1);
    $("#TBPurpose, #TransactionTypeID").attr('disabled', false);
    $("#TBDate, #TBItemName, #TBUnit, #TBItemQuantity, #TBItemCost").attr('disabled', false);
    $('#OfficeID').on('change', function (e) {
        $.ajax({
            type: "POST",
            url: '/ManagePR/LoadCombobox?officeID=' + this.value,
            success: function (data) {
                $('#StatusID').html('');
                $.each(data, function () {
                    $('#StatusID').append('<option value="' + this.id + '">' + this.name + '</option>');
                });
            }
        });
    });
    
    $(".chk").click(function () {
        if ($(this).prop("checked")) {
            $('input').prop("checked", false);
            console.log($(this).siblings().text().trim())
            $('#dtPrList').DataTable().columns(4)
                .search($(this).siblings().text().trim())
                .draw();
            $(this).prop("checked", true);
        } else {
            $('#dtPrList').DataTable().columns(4)
                    .search('')
                    .draw();
        }
    });

    $('#btnUpload').click(function () {
        var data = new FormData();
        var files = $("#fileUpload").get(0).files;
        // Add the uploaded image content to the form data collection
        if (files.length > 0) {
            data.append("ExcelFile", files[0]);
        }

        // Make Ajax request with the contentType = false, and procesDate = false
        $.ajax({
            type: "POST",
            url: "/UploadDownload/UploadExcel",
            contentType: false,
            processData: false,
            data: data,
            success: function (res) {
                $.each(res, function () {
                    var obj = JSON.parse(this);
                    var empty = false;
                    var msg = [];
                    $.each(obj, function (index, value) {
                        var arrRes = [];
                        var arrNumRes = [];
                        if (this.Item_Name == "") {
                            arrRes.push("Item Name");
                            empty = true;
                        }

                        if (this.Unit == "") {
                            arrRes.push("Unit");
                            empty = true;
                        }

                        if (this.QTY == "" || isNaN(this.QTY)) {
                            arrNumRes.push("Qty");
                            empty = true;
                        }

                        if (this.Unit_Cost == "" || isNaN(this.Unit_Cost)) {
                            arrNumRes.push("Unit Cost");
                            empty = true;
                        }

                        if (arrRes.length != 0 || arrNumRes.length != 0) {
                            var col1 = arrRes.length > 1 ? " columns " : " column ";
                            var col2 = arrNumRes.length > 1 ? " columns " : " column ";
                            if (arrRes.length > 0 && arrNumRes.length == 0) {
                                msg.push("Row " + Number(index + 1) + col1 + arrRes.toString() + " must not be empty");
                            } else if (arrRes.length == 0 && arrNumRes.length > 0) {
                                msg.push("Row " + Number(index + 1) + col2 + arrNumRes.toString() + " must be a number");
                            } else {
                                msg.push("Row " + Number(index + 1) + " columns " + arrRes.toString() + " must not be empty and " + arrNumRes.toString() + " must be a number");
                            }
                        }
                    });

                    var promptMsg = '';
                    $.each(msg, function (index, value) {
                        promptMsg += value + '</br>';
                    });
                    if (empty) {
                        Swal.fire(
                                                   'Prompt Message',
                                                   'Please check the uploaded excel file data </br>' + '<p style="font-size:12px; text-align:left">' + promptMsg + '</p>',
                                                   'warning'
                        );
                        return false;
                    }

                    var total = 0;
                    $.each(obj, function () {
                        dtItems.row.add([
                           0,
                           0,
                           this.Date == undefined ? "" : this.Date,
                           this.Item_Name,
                           this.Specification == undefined ? "" : this.Specification,
                           this.Unit == undefined ? "" : this.Unit,
                           this.QTY,
                           formatter.format(Number(this.Unit_Cost).toFixed(2)).replace("$", ""),
                        ]).draw(false);

                        total += this.QTY * Number(this.Unit_Cost).toFixed(2);
                        //dtItems.rows().every(function () {
                        //    var d = this.data();
                        //    total += Number((d[6]) * Number(d[7].replace(/,/g, ''))).toFixed(2);
                        //    d.counter++; // update data source for the row
                        //    this.invalidate(); // invalidate the data DataTables has cached for this row
                        //});


                        $('#TBTotal').val(formatter.format(Number(total).toFixed(2)).replace("$", ""));
                        $("#modal-import").modal('hide');
                    });
                });
            }
        });
    });

    var dtGetPRs = $("#dtPrList").DataTable({
        destroy: true,
        responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        order: [[1, "desc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/ManagePR/GetPRs" },
        autoWidth: false,
        columns:
            [
                //{
                //    "className": 'details-control',
                //    "orderable": false,
                //    "data": null,
                //    "defaultContent": ''
                //},
                { data: "ControlNumber", title: "Control Number", sClass: "text-center" },
                { data: "PRNumber", title: "PR No.", sClass: "text-center", visible: true },
                {
                    data: "DatePRPrepared", title: "Prepared", sClass: "text-center", visible: false
                },
                { data: "DivisionName", title: "Concerned Division", sClass: "text-center", visible: false },
                { data: "Status", title: "Status", sClass: "text-center" },
                { data: "Remarks", title: "Remarks", sClass: "text-center" },
                { data: "PurchaseRequestID", visible: false },
                { data: "UserID", visible: false },
                { data: "TransactionTypeID", visible: false },
                { data: "DatePrepared", title: "Submitted", sClass: "text-center", visible: false },
                { data: "Purpose", title: "Purpose" },
                { data: "TransactionType", title: "Transaction Type", sClass: "text-center" },
                {
                    data: "Amount", title: "Amount", sClass: "text-right",
                    render: function (data, type, row, meta) {
                        return `<h6>` + data + `</h6>`;
                    }
                },
                { data: "TransactionDate", title: "Submitted", sClass: "text-center", visible: false },
            ],
        columnDefs: [
            {
                width: "10%", targets: [0, 1, 2, 6, 7]
            },
            {
                orderable: false,
                targets: ["_all"]
            }
        ],
        "order": [[ 13, "desc" ]],
        dom: 'Bfrtip',
        select:true,
        buttons: [
            {
                text: '<i class="fas fa-file-signature"> </i> Receive',
                action: function (e, dt, node, config) {
                    var dt = dtGetPRs.row({ selected: true }).data();
                    if (dt == undefined) {
                        Swal.fire(
                                 'Message!',
                                 'Please select record to receive!',
                                 'warning'
                               );
                        return false;
                    }

                    Swal.fire({
                        title: 'Receive PR Document',
                        text:
                        'Please input remarks if necessary',
                        input: 'text',
                        inputAttributes: {
                            autocapitalize: 'off'
                        },
                        showCancelButton: true,
                        showLoaderOnConfirm: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, Confirm received!',
                        preConfirm: (data) => {
                            var Log = {
                                PurchaseRequestID: dt.PurchaseRequestID,
                                StatusID: 14,
                                Remarks: data
                            };
                            $.ajax({
                                type: "POST",
                                url: '/ManagePR/SubmitPR',
                                data: { log: Log, PRNumber: '', PRDate: '', ForRevision: false },
                                success: function (data) {
                                    Swal.fire(
                                      'Received!',
                                      'PR has been successfully received.',
                                      'success'
                                    );
                                    dtGetPRs.button(0).enable(false);
                                    dtGetPRs.ajax.reload();
                                    signalR.server.notifyUser();
                                }
                            });
                        },
                        allowOutsideClick: false
                    });
                },
                init: function (api, node, config) {
                    $(node).removeClass('btn-secondary'),
                     $(node).addClass('btn-success')
                }
            },
            {
                text: '<i class="nav-icon far fa-play-circle" title="Submit PR"></i> Submit PR',
                action: function (e, dt, node, config) {
                    // Submit
                    var dt = dtGetPRs.row({ selected: true }).data();
                    $.ajax({
                        url: '/ManagePR/GetNextProcess?&purchaseRequestID=' + dt.PurchaseRequestID,
                        type: 'get',
                        contentType: "application/json",
                        success: function (result) {
                            var o = result.pr;
                            $('#TBPurpose1').val(o.Purpose);
                            $('#TBTransactionTypeID').val(o.TransactionTypeID);
                            $('#TBAmount').val(formatter.format(o.Amount).replace("$", ""));
                            $('#OfficeID').val(result.officeID);
                            $('#StatusID').val(result.statusID);
                            $('#dBac').hide();
                        },
                        error: function (request, error) {
                            alert(" Can't do because: " + error);
                        }
                    });
                    $('#modal-submit').modal('show');
                },
                init: function (api, node, config) {
                    $(node).removeClass('btn-secondary'),
                     $(node).addClass('btn-primary')
                }
            },
            {
                text: '<i class="nav-icon fas fa-pencil-alt" title="Edit PR"></i> Edit',
                action: function (e, dt, node, config) {
                    // Edit
                    var dt = dtGetPRs.row({ selected: true }).data();
                    $.ajax({
                        url: '/ManagePR/GetPurchaseRequest?&purchaseRequestID=' + dt.PurchaseRequestID,
                        type: 'GET',
                        dataType: "json",
                        success: function (result) {
                            var purchaseRequest = JSON.parse(result.PurchaseRequest)[0];
                            $('#TBPurpose').val(purchaseRequest.Purpose),
                            $('#TransactionTypeID').val(purchaseRequest.TransactionTypeID);
                            $('#hidPurchaseRequestID').val(purchaseRequest.PurchaseRequestID);
                            var dtItems = $("#dtItems").DataTable();
                            dtItems.clear().draw();
                            //if (purchaseRequest.StatusID == 15 || purchaseRequest.StatusID == 9) {
                            //    $("#TBPurpose, #TransactionTypeID").attr('disabled', false);
                            //    $("#TBDate, #TBItemName, #TBUnit, #TBItemQuantity, #TBItemCost").attr('disabled', false);
                            //} else {
                            //    $("#TBPurpose, #TransactionTypeID").attr('disabled', true);
                            //    $("#TBDate, #TBItemName, #TBUnit, #TBItemQuantity, #TBItemCost").attr('disabled', true);
                            //}

                            var total = 0;
                            $.each(purchaseRequest.PurchaseRequestDetail, function () {
                                var purchaseRequestDetail = this;
                                if (purchaseRequestDetail.ActivityDate !== null) {
                                    //var d = new Date(parseInt(purchaseRequestDetail.ActivityDate.substr(6)));
                                    purchaseRequestDetail.ActivityDate = GetJSONDate(purchaseRequestDetail.ActivityDate)
                                }
                                dtItems.row.add([
                                   purchaseRequestDetail.PurchaseRequestDetailID,
                                   0,
                                   purchaseRequestDetail.ActivityDate,
                                   purchaseRequestDetail.ItemName,
                                   purchaseRequestDetail.Specification,
                                   purchaseRequestDetail.Unit,
                                   purchaseRequestDetail.Quantity,
                                   formatter.format(purchaseRequestDetail.UnitCost).replace("$", ""),
                                ]).draw(false);
                                total += parseFloat(Number(purchaseRequestDetail.TotalCost).toFixed(2));
                            });
                            $('#TBTotal').val(formatter.format(Number(total).toFixed(2)).replace("$", ""));
                            dtItems.button(2).enable(false);
                            dtItems.button(3).enable(false);
                            $('.nav-tabs a:first').tab('show');
                            $('#btnCreatePR').html('Update PR');
                            var obj = {
                                PurchaseRequestID: $('#hidPurchaseRequestID').val(),
                                Purpose: $('#TBPurpose').val(),
                                TransactionTypeID: $('#TransactionTypeID').val(),
                                dt: dtGetPRs.rows().data()
                            }
                            StorePRDetail(obj)
                        },
                        error: function (request, error) {
                            alert(" Can't do because: " + error);
                        }
                    });
                },
                init: function (api, node, config) {
                    $(node).removeClass('btn-secondary'),
                     $(node).addClass('btn-warning')
                }
            },
            {
                text: '<i class="fas fa-print"  title="Generate Report"></i> Print',
                action: function (e, dt, node, config) {
                    var dt = dtGetPRs.row({ selected: true }).data();
                    if (dt !== undefined) {
                        var reports;

                        if (dt.Status == 'For Preparation of ORS and DV (Requesting Unit)') {
                            reports = {
                                ORS: 'Obligation Request and Status',
                                DV: 'Disbursement Voucher',
                                DVBIR: 'Disbursement Voucher (BIR)',
                                PRHistory: 'PR History',
                            };
                        } else {
                            reports = {
                                PR: 'Purchase Request Report',
                                RIS: 'Requisition and Issue Slip',
                                PRHistory: 'PR History',
                            };
                        }
                        Swal.fire({
                            title: 'Select Report to Generate',
                            input: 'select',
                            inputOptions: reports,
                            inputPlaceholder: 'Select a report',
                            showCancelButton: true,
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Generate Report',
                            inputValidator: (value) => {
                                console.log(value)
                                if (value == '') return false;
                                switch (value) {
                                    case "":
                                        return false;
                                        break;
                                    case "ORS":
                                    case "DV":
                                    case "RIS":
                                        $('#modal-preparedby').modal('show');
                                        $("#UserID").val(dt.UserID);
                                        $("#btnGenerateRIS").off().on("click", function () {
                                            if ($("#UserID").val() == "") {
                                                Swal.fire(
                                                  'Warning',
                                                  'Prepared by must not be empty!',
                                                  'warning'
                                                );
                                                return false;
                                            } else {
                                                var success = false;
                                                $.ajax({
                                                    type: 'POST',
                                                    url: '/ManagePR/UpdatePR',
                                                    async: false,
                                                    data: { PurchaseRequestID: dt.PurchaseRequestID, PreparedBy: $("#UserID").val() },
                                                    success: function (res) {
                                                        $('#modal-preparedby').modal('hide');
                                                        success = true;
                                                    }
                                                });
                                                if (success) {
                                                    window.open("/ManagePR/GenerateReport?purchaseRequestID=" + dt.PurchaseRequestID + "&reportType=" + value, "_blank");
                                                }
                                            }
                                        });
                                        break;
                                    case "DVBIR":
                                        // Do Something
                                        if (value == 'DVBIR') {
                                            value = "DV (BIR)";
                                        }
                                        $('#btnGenerate').html('Generate ' + value);
                                        $('#modal-po').modal('show');
                                        var dtPOItems = $('#dtPOItems').DataTable({
                                            destroy: true,
                                            responsive: true,
                                            select: true,
                                            ajax: { "url": "/ManagePR/GetPurchaseOrders?&PurchaseRequestID=" + dt.PurchaseRequestID },
                                            columns: [
                                                    { data: "PurchaseOrderID", visible: false, title: "PurchaseOrderID" },
                                                    { data: "PRNumber", title: "PO Number" },
                                                    { data: "SupplierName", title: "Supplier Name" },
                                                    { data: "Purpose", title: "Purpose" },
                                                    { data: "Amount", title: "Amount" }
                                            ],
                                            initComplete: function (setting, json) {
                                                $('#dtPOItems tbody').off().on('click', 'tr', function (e) {
                                                    var dt = dtPOItems.row({ selected: true }).data();
                                                    $("#hidPurchaseOrderID").val(dt.PurchaseOrderID);
                                                });
                                            }
                                        });
                                        break;
                                    default:
                                        window.open("/ManagePR/GenerateReport?purchaseRequestID=" + dt.PurchaseRequestID + "&reportType=" + value, "_blank");
                                }
                            }
                        });
                    } else {
                        Swal.fire(
                                 'Message!',
                                 'Please select record to remove!',
                                 'warning'
                               );
                    }
                }
            },
            {
                text: '<i class="fas fa-shopping-cart"  title="View PR Items"></i> View PR Items',
                action: function (e, dt, node, config) {
                    var dt = dtGetPRs.row({ selected: true }).data();
                    if (dt !== undefined) {
                        $('#dtPRItems').DataTable({
                            destroy: true,
                            responsive: true,
                            ajax: { "url": "/ManagePR/GetPRItems?&PurchaseRequestID=" + dt.PurchaseRequestID },
                            columns: [
                                    { data: "ActivityDate", title: "Activity Date" },
                                    { data: "ItemName", title: "Item Name" },
                                    { data: "Specification", title: "Specification" },
                                    { data: "Unit", title: "Unit" },
                                    { data: "Quantity", title: "Quantity" },
                                    { data: "UnitCost", title: "Cost" },
                                    { data: "TotalCost", title: "Total" }
                            ]
                        });
                        $("#modal-items").modal('show');
                    } else {
                        Swal.fire(
                                 'Message!',
                                 'Please select record to remove!',
                                 'warning'
                               );
                    }
                }
            },
            {
                text: '<i class="fas fa-history"  title="View History"></i> Track PR',
                action: function (e, dt, node, config) {
                    // Logs
                    var dt = dtGetPRs.row({ selected: true }).data();
                    if (dt == undefined) {
                        Swal.fire(
                      'Prompt Message',
                      'Please select record to view...',
                      'warning');
                        return false;
                    }
                    GetLogs(dt.PurchaseRequestID);
                }
            },
            {
                text: '<i class="fas fa-ban"  title="Cancel PR"></i> Cancel PR',
                action: function (e, dt, node, config) {
                    // Cancel PR
                    var dt = dtGetPRs.row({ selected: true }).data();
                    if (dt == undefined) {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Oops...',
                            text: 'Please select a record to cancel!'
                        });
                    } else {
                        Swal.fire({
                            title: 'Confirmation Message',
                            text:
                            'Cancelling PR with Control Number ' + dt.ControlNumber,
                            input: 'text',
                            inputAttributes: {
                                autocapitalize: 'on'
                            },
                            showCancelButton: true,
                            confirmButtonText: 'Confirm',
                            showLoaderOnConfirm: true,
                            preConfirm: (data) => {
                                if (data == '') {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Oops...',
                                        text: 'Please input reason for cancelling PR'
                                    });
                                    return false;
                                } else {
                                    var Log = {
                                        PurchaseRequestID: dt.PurchaseRequestID,
                                        StatusID: 10,
                                        Remarks: data
                                    }
                                    $.ajax({
                                        type: "POST",
                                        url: '/ManagePR/SubmitPR',
                                        data: {
                                            log: Log, PRNumber: '', PRDate: '', ForRevision: false
                                        },
                                        success: function (data) {
                                            $('.modal').modal('hide');
                                            signalR.server.notifyUser();
                                            dtGetPRs.ajax.reload();
                                            Swal.fire(
                                              'Message!',
                                              'You have successfully cancelled PR!',
                                              'success'
                                            );
                                        }
                                    });
                                }
                            },
                            allowOutsideClick: false
                        });
                    }
                },
                 init: function (api, node, config) {
                    $(node).removeClass('btn-secondary'),
                     $(node).addClass('btn-danger')
                }
            },
        ],
        initComplete: function (setting, json) {
            //$('#checkboxPreparing').click();
            $('#lblMessage').html('Are you sure to cancel PR?');

            // 0 = Receive; 1 = Print; 2 = View Items; 3 = Submit; 4 = Edit; 5 = History; 6 = Cancel;
            for (var i = 0; i < 7; i++) {
                dtGetPRs.button(i).enable(false);
            }

            for (var i = 0; i < 7; i++) {
                dtGetPRs.button(i).enable(false);
            }
        }
    }).on('select', function (e, dt, type, indexes) {
        var dt = dtGetPRs.row({ selected: true }).data();
      
        if (dt != undefined) {
            switch (dt.Status) {
                case 'Preparing':
                    dtGetPRs.button(3).enable(true); // Print
                    dtGetPRs.button(5).enable(true); // View Items
                    dtGetPRs.button(1).enable(true); // Submit
                    dtGetPRs.button(2).enable(true); // Edit
                    dtGetPRs.button(4).enable(true); // History 
                    dtGetPRs.button(6).enable(true); // Cancel
                    break;
                case 'Returned to Concerned Division':
                case 'For Signatory (Division Chief) - ORS':
                    if (dt.IsReceived) {
                        dtGetPRs.button(0).enable(false); // Print
                        dtGetPRs.button(3).enable(true); // Print
                        dtGetPRs.button(4).enable(true); // View Items
                        dtGetPRs.button(1).enable(true); // Submit
                        dtGetPRs.button(2).enable(dt.ForRevision == null || dt.ForRevision == false ? false : true); // Edit
                        dtGetPRs.button(5).enable(true); // History 
                        dtGetPRs.button(6).enable(true); // Cancel
                    } else {
                        dtGetPRs.button(0).enable(true); // Print
                        dtGetPRs.button(3).enable(false); // Print
                        dtGetPRs.button(4).enable(true); // View Items
                        dtGetPRs.button(1).enable(false); // Submit
                        dtGetPRs.button(2).enable(false); // Edit
                        dtGetPRs.button(5).enable(true); // History 
                        dtGetPRs.button(6).enable(false); // Cancel
                    }
                    break;
                case 'Cancelled':
                    dtGetPRs.button(3).enable(true); // Print
                    dtGetPRs.button(4).enable(true); // View Items
                    dtGetPRs.button(1).enable(false); // Submit
                    dtGetPRs.button(2).enable(false); // Edit
                    dtGetPRs.button(4).enable(true); // History 
                    dtGetPRs.button(6).enable(false); // Cancel
                    break;
                default:
                    dtGetPRs.button(0).enable(false); // Print
                    dtGetPRs.button(3).enable(true); // Print
                    dtGetPRs.button(4).enable(true); // View Items
                    dtGetPRs.button(1).enable(false); // Submit
                    dtGetPRs.button(2).enable(true); // Edit
                    dtGetPRs.button(5).enable(true); // History 
                    dtGetPRs.button(6).enable(true); // Cancel
            }
        }

        if (role == 'Administrator') {
            dtGetPRs.button(0).enable(true); // Print
            dtGetPRs.button(3).enable(true); // Print
            dtGetPRs.button(4).enable(true); // View Items
            dtGetPRs.button(1).enable(true); // Submit
            dtGetPRs.button(2).enable(true); // Edit
            dtGetPRs.button(5).enable(true); // History 
            dtGetPRs.button(6).enable(true); // Cancel
        }
    }).on('deselect', function (e, dt, type, indexes) {
        //$('#checkboxPreparing').click();
        $('#lblMessage').html('Are you sure to cancel PR?');

        // 0 = Receive; 1 = Print; 2 = View Items; 3 = Submit; 4 = Edit; 5 = History; 6 = Cancel;
        for (var i = 0; i < 7; i++) {
            dtGetPRs.button(i).enable(false);
        }

        for (var i = 0; i < 7; i++) {
            dtGetPRs.button(i).enable(false);
        }
    });

    var removeList = [];
    var dtItems = $("#dtItems").DataTable({
        searching: true,
        bPaginate: false,
        ordering: false,
        columns: [
        { title: "PurchaseRequestDetailID", visible: false },
        { title: "PurchaseRequestID", visible: false },
        { title: "Activity Date" },
        { title: "Item Name" },
        { title: "Specification" },
        { title: "Unit" },
        { title: "Quantity" },
        { title: "Unit Cost" },
        ],
        select:true,
        dom: 'Bfrtip',
        buttons: [
            {
                text: '<i class="fas fa-upload" title="Upload"></i> Upload Template',
                action: function (e, dt, node, config) {
                    $("#modal-import").modal('show');
                }
            },
            {
                text: '<i class="far fa-plus-square"  title="New"></i> New Item',
                action: function (e, dt, node, config) {
                    $('#hidPurchaseRequestDetailID').val(0);
                    dtItems.button(2).enable(false);
                    dtItems.row({ selected: true }).deselect();
                    $("#modal-create").modal('show');
                }
            },
            {
                text: '<i class="nav-icon fas fa-pencil-alt" title="Edit"></i> Edit',
                action: function (e, dt, node, config) {
                    var dt = dtItems.row({ selected: true }).data();
                    if (dt !== undefined) {
                        dtItems.button(2).enable(false);
                        dtItems.button(3).enable(true);
                        $("#modal-create").modal('show');
                        var dt = dtItems.row({ selected: true }).data();
                        $('#hidPurchaseRequestDetailID').val(dt[0]);
                        $('#TBDate').val(dt[2]);
                        $('#TBItemName').val(dt[3]);
                        $('#TBSpecification').val(dt[4]);
                        $('#TBUnit').val(dt[5]);
                        $('#TBItemQuantity').val(Number(dt[6]));
                        $('#TBItemCost').val(Number(dt[7].replace(/,/g, '')));

                        var total = 0;
                        dtItems.rows().every(function () {
                            var d = this.data();
                            total += (d[6]) * Number((d[7]).replace(/,/g, '')).toFixed(2);
                            d.counter++; // update data source for the row
                            this.invalidate(); // invalidate the data DataTables has cached for this row
                            
                            $('#TBTotal').val(formatter.format(Number(total).toFixed(2)).replace("$", ""));
                        });
                    } else {
                        Swal.fire(
                                 'Message!',
                                 'Please select record to edit!',
                                 'warning'
                               );
                    }
                }
            },
            {
                text: '<i class="far fa-trash-alt"  title="Delete"></i> Remove',
                action: function (e, dt, node, config) {
                    var dt = dtItems.row({ selected: true }).data();
                    if (dt !== undefined) {
                        Swal.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, Confirm delete!'
                        }).then((result) => {
                            if (result.value) {
                                var d = dtItems.row(dtItems.row({ selected: true })).data();
                                var PurchaseRequestDetail = {
                                    PurchaseRequestDetailID: d[0],
                                    PurchaseRequestID: -1,
                                    ActivityDate: d[2],
                                    ItemName: d[3],
                                    Specification: d[4],
                                    Unit: d[5],
                                    Quantity: d[6],
                                    UnitCost: d[7]
                                }
                                if (d[0] !== "0") {
                                    removeList.push(PurchaseRequestDetail);
                                }

                                dtItems.row(dtItems.row({ selected: true })).remove().draw();
                                var total = 0;
                                dtItems.rows().every(function () {
                                    var d = this.data();
                                    total += Number((d[6]) * Number(d[7].replace(/,/g, ''))).toFixed(2);
                                    d.counter++; // update data source for the row
                                    this.invalidate(); // invalidate the data DataTables has cached for this row
                                });
                                $('#TBItemName, #TBItemQuantity, #TBItemCost, #TBUnit').val('');
                                $('#TBTotal').val(formatter.format(Number(total).toFixed(2)).replace("$", ""));

                            }
                        });
                    } else {
                        Swal.fire(
                                 'Message!',
                                 'Please select record to remove!',
                                 'warning'
                               );
                    }
                }
            }
        ],
        initComplete: function (setting, json) {


        }
    }).on('select', function (e, dt, type, indexes) {
        dtItems.button(2).enable(true);
        dtItems.button(3).enable(true);
    }).on('deselect', function (e, dt, type, indexes) {
        dtItems.button(2).enable(false);
        dtItems.button(3).enable(false);
    });


  

    var storedData = localStorage.getItem("jsonData");
    var o = JSON.parse(storedData);
    if (storedData !== null) {
        $('#hidPurchaseRequestID').val(o.PurchaseRequestID);
        $('#TBPurpose').val(o.Purpose);
        $('#TransactionTypeID').val(o.TransactionTypeID)

        var total = 0;
        $.each(o.Items, function () {
            var rowData = this;
            dtItems.row.add([
                  rowData[0],
                  rowData[1],
                  rowData[2],
                  rowData[3],
                  rowData[4],
                  rowData[5],
                  rowData[6],
                  rowData[7]
            ]).draw(false);


            total += (rowData[6]) * Number((rowData[7]).replace(/,/g, '')).toFixed(2);
        });

        var total = formatter.format(Number(total).toFixed(2)).replace("$", "");
        $('#TBTotal').val(total);
    }

    $('#btnGenerate').click(function () {
        var purchaseOrderID = $("#hidPurchaseOrderID").val();
        var res = $('#btnGenerate').html();
        switch (res) {
            case "Generate ORS":
                res = "ORS";
                break;
            case "Generate DV":
                res = "DV";
                break;
            case "Generate DV (BIR)":
                res = "DVBIR";
                break;
        }
        if (res == "ORS") {
            window.open("/ManagePR/GenerateReport2?purchaseOrderID=" + purchaseOrderID + "&reportType=" + res + "&taxComputation=", "_blank");
            $('#modal-po').modal('hide');
        } else {
            Swal.fire({
                title: 'Compute Taxable Amount',
                input: 'select',
                inputOptions: {
                    VATgoods: 'VAT goods',
                    VATservices: 'VAT services',
                    NONVATgoods: 'NONVAT goods',
                    NONVATservices: 'NONVATservices',
                },
                inputPlaceholder: 'Select a Tax Computation',
                showCancelButton: true,
                inputValidator: (value) => {
                    switch (value) {
                        case 'VATgoods':
                            value = "VAT goods";
                            break;
                        case 'VATservices':
                            value = "VAT services";
                            break;
                        case 'NONVATgoods':
                            value = "NONVAT goods";
                            break;
                        case 'NONVATservices':
                            value = "NONVAT services";
                            break;
                        default:
                    }

                    window.open("/ManagePR/GenerateReport2?purchaseOrderID=" + purchaseOrderID + "&reportType=" + res + "&taxComputation=" + value, "_blank");
                    $('#modal-po').modal('hide');
                }
            })
        }
    });

    $('#btnCreatePR').attr('disabled', false);
    $('#btnCreatePR').click(function () {
        var list = [];
        dtItems.rows().every(function () {
            var d = this.data();
            var PurchaseRequestDetail = {
                PurchaseRequestDetailID: d[0],
                PurchaseRequestID: $('#btnCreatePR').html() == 'Create PR' ? d[1] : $('#hidPurchaseRequestID').val(),
                ActivityDate: d[2],
                ItemName: d[3],
                Specification: d[4],
                Unit: d[5],
                Quantity: d[6],
                UnitCost: (d[7]).replace(/,/g, '')
            }

            list.push(PurchaseRequestDetail);

            d.counter++; // update data source for the row
            this.invalidate(); // invalidate the data DataTables has cached for this row
        });

        $.each(removeList, function () {
            list.push(this);
        });

        var PurchaseRequest = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            Purpose: $('#TBPurpose').val(),
            TransactionTypeID: $('#TransactionTypeID').val(),
            Amount: $('#TBTotal').val().replace(/,/g, ''),
            PurchaseRequestDetails: list
        }

        if (PurchaseRequest.Purpose == "") {
            Swal.fire(
                          'Prompt Message',
                          'Please Input Purpose of PR',
                          'warning'
                    );
            return false;
        }

        if (PurchaseRequest.TransactionTypeID.toString() == "") {
            Swal.fire(
                          'Prompt Message',
                          'Please Select Transaction Type',
                          'warning'
                    );
            return false;
        }

        if (PurchaseRequest.Amount == "") {
            Swal.fire(
                          'Prompt Message',
                          'Please Add Items for PR',
                          'warning'
                    );
            return false;
        }
        
        $('#btnCreatePR').attr('disabled', true);
        $.ajax({
            type: 'POST',
            url: '/ManagePR/SavePurchaseRequest',
            data: { purchaseRequest: PurchaseRequest },
            success: function (res) {
                if (res.success) {
                    Swal.fire(
                          'Prompt Message',
                          res.message,
                          'success'
                    );

                    $('#btnCreatePR').attr('disabled', false);
                    $('#btnCreatePR').html('Create PR');
                    signalR.server.notifyUser();
                    localStorage.clear();
                    removeList = [];
                } else {
                    Swal.fire(
                          'Prompt Message',
                          res.message,
                          'error'
                    );
                }
                $('input:not(input[type=checkbox], input[type=radio]), textarea, select').val('');
                dtItems.clear().draw();
                dtItems.button(2).enable(false);
                dtItems.button(2).enable(false);
                $('#dtPrList').DataTable().ajax.reload();
            },
            error: function (request, error) {
                alert(" Can't do because: " + error); 
                $('#btnCreatePR').attr('disabled', false);
                $('#btnCreatePR').html('Create PR');
                $('input:not(input[type=checkbox], input[type=radio]), textarea, select').val('');
                dtItems.clear().draw();
                dtItems.button(2).enable(false);
                dtItems.button(2).enable(false);
                $('#dtPrList').DataTable().ajax.reload();
            }
        });
    });

    $("#btnAddtoList").click(function () {
        var dt = dtItems.row({selected:true}).data();
        var empty = false;
        if ($('#TBItemName').val() == "") {
            empty = true;
        }

        if ($('#TBUnit').val() == "") {
            empty = true;
        }

        if (parseFloat(Number($('#TBItemQuantity').val())) == 0) {
            empty = true;
        }

        if (parseFloat(Number($('#TBItemCost').val())) == 0) {
            empty = true;
        }

        if (empty) {
            Swal.fire(
                           'Prompt Message',
                           'Please input required fields, marked with <span style="color:red">*</span>',
                           'warning'
                     );
            return false;
        }

        if (dt != undefined) {
            dt[0] = $('#hidPurchaseRequestDetailID').val();
            dt[1] = $('#hidPurchaseRequestID').val();
            dt[2] = $('#TBDate').val();
            dt[3] = $('#TBItemName').val();
            dt[4] = $('#TBSpecification').val();
            dt[5] = $('#TBUnit').val();
            dt[6] = $('#TBItemQuantity').val();
            dt[7] = formatter.format($('#TBItemCost').val()).replace("$", "");
            dtItems.row({selected:true}).data(dt);
            dtItems.draw();
        } else {
            dtItems.row.add([
               $('#hidPurchaseRequestDetailID').val(),
               $('#hidPurchaseRequestID').val(),
               $('#TBDate').val(),
               $('#TBItemName').val(),
               $('#TBSpecification').val(),
               $('#TBUnit').val(),
               $('#TBItemQuantity').val(),
               $('#TBItemCost').val(),
            ]).draw(false);
        }
        $("#modal-create").modal('hide');
        var total = 0;
        dtItems.rows().every(function () {
            var d = this.data();
            total += (d[6]) * Number((d[7]).replace(/,/g, '')).toFixed(2);
            d.counter++; // update data source for the row
            this.invalidate(); // invalidate the data DataTables has cached for this row
        });

        $('#TBItemName,#TBSpecification, #TBItemQuantity, #TBItemCost, #TBUnit, #TBDate').val('');
        $('#hidPurchaseRequestDetailID').val(0);

        var total = formatter.format(Number(total).toFixed(2)).replace("$", "");
        $('#TBTotal').val(total);

        var obj = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            Purpose: $('#TBPurpose').val(),
            TransactionTypeID: $('#TransactionTypeID').val(),
            dt: dtGetPRs.rows().data()
        }
        StorePRDetail(obj)
        dtItems.row({ selected: true }).deselect();
    });

    $('#btnClear').click(function () {
        $('#btnCreatePR').html('Create PR');
        $('#TBPurpose').val('');
        $('#TransactionTypeID').val(-1)
        $('#hidPurchaseRequestID').val(0);
        $('#TBTotal').val('');
        $("#TBPurpose, #TransactionTypeID").attr('disabled', false);
        $("#TBDate, #TBItemName, #TBUnit, #TBItemQuantity, #TBItemCost").attr('disabled', false);
        dtItems.button(2).enable(false);
        localStorage.clear();
        dtItems.clear().draw();
    });

    $('#btnSubmitPR').attr('disabled', false);
    $('#btnSubmitPR').click(function () {
        var dtTable = $("#dtPrList").DataTable();
        var dt = dtTable.row({selected:true}).data();
        var Log = {
            PurchaseRequestID: dt.PurchaseRequestID,
            StatusID: $('#StatusID').val(),
            OfficeID: $('#OfficeID').val(),
            Remarks: $('#TBRemarks').val()
        };

        $('#btnSubmitPR').attr('disabled', true);
        $.ajax({
            type: 'POST',
            url: '/ManagePR/SubmitPR',
            data: { log: Log, PRNumber: '', PRDate: '', ForRevision: false },
            success: function (res) {
                dtTable.ajax.reload();
                if (res.success) {
                    Swal.fire(
                          'Prompt Message',
                          res.message,
                          'success'
                    );
                    $('#btnSubmitPR').attr('disabled', false);
                    signalR.server.notifyUser();
                    signalR.server.desktopNotification(dt.PurchaseRequestID);
                    $('#modal-submit').modal('hide');
                } else {
                    Swal.fire(
                          'Prompt Message',
                          res.message,
                          'error'
                    );
                }
            }
        });
    });
});

function StorePRDetail(o) {
    // Storing data:
    var myObj = {
        PurchaseRequestID: o.PurchaseRequestID,
        Purpose: o.Purpose,
        TransactionTypeID: o.TransactionTypeID,
        Items: $('#dtItems').DataTable().rows().data().toArray()
    };
    var myJSON = JSON.stringify(myObj);
    localStorage.setItem("jsonData", myJSON);
}
