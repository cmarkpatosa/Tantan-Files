$(document).ready(function () {
    $(".chk").click(function () {
        if ($(this).prop("checked")) {
            $('input').prop("checked", false);
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

    $('#modal-po').on('hidden.bs.modal', function () {
        $("#hidPurchaseOrderID").val("");
    })

    $('#TBPRDate').inputmask('mm/dd/yyyy', {
        'placeholder': 'mm/dd/yyyy'
    });
    var dtGetPRs = $("#dtPrList").DataTable({
        destroy: true,
        //responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        //order: [[0, "asc"]],
        lengthMenu: [
			[5, 10, 20, -1],
			[5, 10, 20, "All"]
        ],
        ajax: {
            "url": "/ManagePR/GetOnProcessPRs"
        },
        autoWidth: false,
        scrollX: true,
        select: true,
        columns: [
			//{
			//    "className": 'details-control',
			//    "orderable": false,
			//    "data": null,
			//    "defaultContent": ''
			//},
			{
			    data: "ControlNumber",
			    title: "Control Number",
			    sClass: "text-center"
			},
			{
			    data: "PRNumber",
			    title: "PR No.",
			    sClass: "text-center",
			    visible: true
			},
			{
			    data: "DatePRPrepared",
			    title: "Prepared",
			    sClass: "text-center",
			    visible: false
			},
			{
			    data: "DivisionName",
			    title: "Concerned Division",
			    sClass: "text-center",
			    visible: true
			},
			{
			    data: "Status",
			    title: "Status",
			    sClass: "text-center"
			},
			{
			    data: "Remarks",
			    title: "Remarks",
			    sClass: "text-center"
			},
			{
			    data: "PurchaseRequestID",
			    visible: false
			},
			{
			    data: "TransactionTypeID",
			    visible: false
			},
			{
			    data: "DatePrepared",
			    title: "Submitted",
			    sClass: "text-center",
			    visible: false
			},
			{
			    data: "Purpose",
			    title: "Purpose"
			},
			{
			    data: "TransactionType",
			    title: "Transaction Type",
			    sClass: "text-center"
			},
			{
			    data: "Amount",
			    title: "Amount",
			    sClass: "text-right",
                render: function (data, type, row, meta) {
                    return `<h6>` + data + `</h6>`;
                }
			},
            { data: "TransactionDate", title: "Submitted", sClass: "text-center", visible: false },
			//{ data: "Supplier", title: "Supplier", sClass: "text-center" },
        ],
        columnDefs: [{
            width: "10%",
            targets: [0, 1, 2, 6, 7]
        },
        {
                orderable: false,
                targets: ["_all"]
            }
        ],
        "order": [[ 12, "desc" ]],
        //select: {
        //    style: 'multi'
        //},
        dom: 'Bfrtip',
        buttons: [{
                text: '<i class="fas fa-file-signature"></i> Receive',
                action: function (e, dt, node, config) {
                    var dt = dtGetPRs.row({
                        selected: true
                    }).data();
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
                        text: 'Please input remarks if necessary',
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
                                data: {
                                    log: Log,
                                    PRNumber: '',
                                    PRDate: '',
                                    ForRevision: false
                                },
                                success: function (data) {
                                    Swal.fire(
                                        'Received!',
                                        'PR has been successfully received.',
                                        'success'
                                    );
                                    dtGetPRs.row({ selected: true }).deselect();
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
                    $(node).removeClass('btn-secondary');
                    $(node).addClass('btn-success');
                }
            },
			{
			    text: '<i class="nav-icon far fa-play-circle" title="Submit"></i> Submit PR',
			    action: function (e, dt, node, config) {
			        // Submit
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
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
			                $.ajax({
			                    type: "POST",
			                    url: '/ManagePR/LoadCombobox?officeID=' + result.officeID,
			                    success: function (data) {
			                        $('#StatusID').html('');
			                        $.each(data, function () {
			                            $('#StatusID').append('<option value="' + this.id + '">' + this.name + '</option>');
			                        });
			                    }
			                });

			                setTimeout(function () {
			                    $('#StatusID').val(result.statusID);
			                }, 500);

			                if (result.statusID == 4 && dt.Status =='For Assignment of PR Number (BAC)') {
			                    $('#dBac').show();
			                } else {
			                    $('#dBac').hide();
			                }
			            },
			            error: function (request, error) {
			                alert(" Can't do because: " + error);
			            }
			        });
			        $('#modal-submit').modal('show');
			    }
			},
			{
			    text: '<i class="fas fa-print"></i> Print',
			    action: function (e, dt, node, config) {
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
			        if (dt !== undefined) {
			            var reports;
			            var purchaseRequestID = dt.PurchaseRequestID;
			            if (dt.Status == 'For Preparation of ORS and DV (Requesting Unit)') {
			                reports = {
			                    ORS: 'Obligation Request and Status',
			                    DV: 'Disbursement Voucher',
			                    DVBIR: 'Disbursement Voucher (BIR)',
			                    PRHistory: 'PR History',
			                };
			            } else if (dt.Status == 'For Canvass (Supply Officer)') {
			                reports = {
			                    Canvass: 'Canvass Form',
			                    PRHistory: 'PR History',
			                };
			            } else if (dt.Status == 'For Abstract of Canvass (BAC)') {
			                reports = {
			                    AbstractOfCanvass: 'Abstract of Canvass',
			                    PRHistory: 'PR History',
			                };
			            } else if (dt.Status == 'For IAR (Supply Officer)') {
			                reports = {
			                    IAR: 'Inspection and Acceptance Report',
			                    PRHistory: 'PR History',
			                };
			            } else {
			                reports = {
			                    PRHistory: 'PR History',
			                };
			            }

			            Swal.fire({
			                title: 'Select Report to Generate',
			                input: 'select',
			                inputOptions: reports,
			                inputPlaceholder: 'Select a report',
			                showCancelButton: true,
			                inputValidator: (value) => {
			                    if (value == '') return false;
			                    switch (value) {
			                        case "":
			                            return false;
			                            break;
			                        case "ORS":
			                        case "DV":
			                        case "DVBIR":
			                            // Do Something
			                            if (value == 'DVBIR') {
			                                value = "DV (BIR)";
			                            }
			                            $('#btnGenerate').html('Generate ' + value);
			                            $('#modal-po').modal('show');
			                            GeneratePO(purchaseRequestID);
			                            break;
			                        case "IAR":
			                            $('#btnGenerate').html('Generate IAR');
			                            $('#modal-po').modal('show');
			                            GeneratePO(purchaseRequestID);
			                            break;
			                        default:
			                            window.open("/ManagePR/GenerateReport?purchaseRequestID=" + purchaseRequestID + "&reportType=" + value, "_blank");
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
			    text: '<i class="fas fa-shopping-cart"></i> View PR Items',
			    action: function (e, dt, node, config) {
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
			        if (dt !== undefined) {
			            var dtPRItems = $('#dtPRItems').DataTable({
			                destroy: true,
			                responsive: true,
			                select: true,
			                ajax: {
			                    "url": "/ManagePR/GetPRItems?&PurchaseRequestID=" + dt.PurchaseRequestID
			                },
			                columns: [{
			                        data: "PurchaseRequestDetailID",
			                        visible: false,
			                        title: "PurchaseRequestDetailID"
			                    },
								{
								    data: "ActivityDate",
								    title: "Activity Date"
								},
								{
								    data: "ItemName",
								    title: "Item Name"
								},
								{
								    data: "Specification",
								    title: "Specification"
								},
								{
								    data: "Unit",
								    title: "Unit"
								},
								{
								    data: "Quantity",
								    title: "Quantity"
								},
								{
								    data: "UnitCost",
								    title: "Cost"
								},
								{
								    data: "TotalCost",
								    title: "Total"
								}
			                ],
			                dom: 'Bfrtip',
			                buttons: [{
			                    text: '<i class="nav-icon fas fa-pencil-alt"  title="New"></i> Update Specification',
			                    action: function (e, dt, node, config) {
			                        var dt = dtPRItems.row({
			                            selected: true
			                        }).data();
			                        Swal.fire({
			                            title: 'Confirmation Message',
			                            text: 'Update Specification for ' + dt.ItemName,
			                            input: 'textarea',
			                            inputPlaceholder: 'Item Specification...',
			                            inputAttributes: {
			                                autocapitalize: 'off'
			                            },
			                            showCancelButton: true,
			                            confirmButtonText: 'Update Specification',
			                            showLoaderOnConfirm: true,
			                            preConfirm: (data) => {
			                                $.ajax({
			                                    type: "POST",
			                                    url: '/ManagePR/UpdateItemSpecification',
			                                    data: {
			                                        purchaseRequestDetailID: dt.PurchaseRequestDetailID,
			                                        specification: data
			                                    },
			                                    success: function (data) {
			                                        dtPRItems.ajax.reload();
			                                        Swal.fire(
														'Message!',
														'You have successfully update Item Specification',
														'success'
													);

			                                    }
			                                });
			                            },
			                            allowOutsideClick: false
			                        });
			                    }
			                }],
			                initComplete: function (setting, json) {

			                }
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
			    text: '<i class="fas fa-shopping-cart"></i> View PO Items',
			    action: function (e, dt, node, config) {
			        // PO Items
			        $('#btnGenerate');
			        $('#modal-po').modal('show');
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
			        GeneratePO(dt.PurchaseRequestID);
			    }
			},
			{
			    text: '<i class="fas fa-history"></i> Track PR',
			    action: function (e, dt, node, config) {
			        // Logs
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
			        if (dt == undefined) {
			            Swal.fire(
							'Prompt Message',
							'Please select record to view...',
							'warning');
			            return false;
			        }
			        GetLogs(dt.PurchaseRequestID);
			        $('#modal-logs').modal('show');
			    }
			},
			{
			    text: '<i class="fas fa-redo"></i> Return PR',
			    action: function (e, dt, node, config) {
			        // Return PR
			        var dt = dtGetPRs.row({
			            selected: true
			        }).data();
			        if (dt == undefined) {
			            Swal.fire({
			                icon: 'warning',
			                title: 'Oops...',
			                text: 'Please select a record to return!'
			            });
			        } else {
			            $('#modal-return').modal('show');

			            $.ajax({
			                url: '/ManagePR/GetPreviousProcess?&purchaseRequestID=' + dt.PurchaseRequestID,
			                type: 'get',
			                contentType: "application/json",
			                success: function (result) {
			                    var o = result.o;
			                    console.log(o)
			                    $('#hidStatusID').val(o.StatusID);
			                    $('#lblReturnPrev').removeClass();
			                    $('#lblReturnPrev').addClass(o.StatusID.toString());
			                    $('#ReturnPRTitle').html('Return PR with Control Number ' + result.pr.ControlNumber);
			                    $('#lblReturnPrev').html('Return ' + o.Status);
			                },
			                error: function (request, error) {
			                    alert(" Can't do because: " + error);
			                }
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
            $('#lblMessage').html('Are you sure to return PR to concerned division?');
            // 0 = Receive; 1 = Print; 2 = View Items; 3 = Submit; 4 = Edit; 5 = History;
            for (var i = 0; i < 7; i++) {
                dtGetPRs.button(i).enable(false);
            }
        }
    }).on('select', function (e, dt, type, indexes) {
        var dt = dtGetPRs.row({
            selected: true
        }).data();
        if (dt != undefined) {
            switch (dt.IsReceived) {
                case true:
                    dtGetPRs.button(0).enable(false); // Receive
                    dtGetPRs.button(1).enable(true); // Submit
                    dtGetPRs.button(2).enable(true); // Print
                    dtGetPRs.button(3).enable(true); // View Items
                    dtGetPRs.button(4).enable(true); // View PO
                    dtGetPRs.button(5).enable(true); // History
                    dtGetPRs.button(6).enable(true); // Return 
                    //if (dt.Status == 'For Abstract of Canvass (BAC)') {
                    //    dtGetPRs.button(1).enable(true); // Submit
                    //}
                    //switch (dt.Status) {
                    //    case 'For Abstract of Canvass (BAC)':
                    //    case 'For Canvass (Supply Officer)':
                    //    case 'For Purchase Order (Supply)':
                    //    case 'For Preparation of ORS and DV (Requesting Unit)':
                    //        dtGetPRs.button(4).enable(false); // Print
                    //        break;
                    //    case 'For IAR (Supply Officer)':
                    //        dtGetPRs.button(2).enable(true); // Print
                    //        dtGetPRs.button(4).enable(true); // Print
                    //        break;
                    //    default:
                    //        dtGetPRs.button(2).enable(false); // Print
                    //}
                    break;
                default:
                    dtGetPRs.button(0).enable(true); // Receive
                    dtGetPRs.button(2).enable(false); // Print
                    dtGetPRs.button(1).enable(false); // Submit
                    dtGetPRs.button(3).enable(false); // View Items
                    dtGetPRs.button(4).enable(false); // History
                    dtGetPRs.button(5).enable(false); // History
                    dtGetPRs.button(6).enable(false); // Return 
            }
        }
    }).on('deselect', function (e, dt, type, indexes) {
        $('#lblMessage').html('Are you sure to return PR to concerned division?');
        // 0 = Receive; 1 = Print; 2 = View Items; 3 = Submit; 4 = Edit; 5 = History;
        for (var i = 0; i < 7; i++) {
            dtGetPRs.button(i).enable(false);
        }
    });

    $('#checkboxReturnPrev').change(function () {
        $("#checkboxRevise").attr('disabled', $(this).prop('checked'))
        $("#checkboxRevise").prop('checked', false);
    });

    $('#checkboxRevise').change(function () {
        $("#checkboxReturnPrev").attr('disabled', $(this).prop('checked'))
        $("#checkboxReturnPrev").prop('checked', false);
    });

    $('#btnGenerate').click(function () {
        var purchaseOrderID = $("#hidPurchaseOrderID").val();
        if (purchaseOrderID == 0) {
            Swal.fire(
				'Message!',
				'Please select a record to generate!',
				'warning'
			);
            return false;
        }

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
            default:
                res = "IAR"
        }

        if (res == "IAR") {
            window.open("/ManagePR/GenerateReport2?purchaseOrderID=" + purchaseOrderID + "&reportType=IAR", "_blank");
        } else if (res == "ORS") {
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

    var dtItems = $("#dtCanvassPRItems").DataTable({
        searching: false,
        bPaginate: false,
        select: true,
        columns: [{
                title: "PurchaseRequestDetailID",
                visible: false
            },
			{
			    title: "PurchaseRequestID",
			    visible: false
			},
			{
			    title: "Item Description"
			},
			{
			    title: "Unit"
			},
			{
			    title: "Quantity"
			},
        ],
        initComplete: function (setting, json) {

        }
    });

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

    // disable html elements
    $('#btnSubmitPR, #btnReturnPR').attr('disabled', false);
    $('#btnReturnPR').click(function () {
        if ($('#TBReturnRemarks').val() == '') {
            Swal.fire(
				'Message!',
				'Please input reason for returning PR!',
				'warning'
			);
            return false;
        } else {
            var dt = dtGetPRs.row({
                selected: true
            }).data();
            var Log = {
                PurchaseRequestID: dt.PurchaseRequestID,
                StatusID: $('#checkboxReturnPrev').prop('checked') == true ? parseInt($('#lblReturnPrev').attr('class')) : 9,
                Remarks: 'PR Returned ' + $('#TBReturnRemarks').val()
            }

            $('#btnReturnPR').attr('disabled', true);
            $.ajax({
                type: "POST",
                url: '/ManagePR/SubmitPR',
                data: {
                    log: Log,
                    PRNumber: '',
                    PRDate: '',
                    ForRevision: $('#checkboxRevise').prop('checked'),
                },
                success: function (data) {
                    $('#btnReturnPR').attr('disabled', false);
                    $('#checkboxReturnPrev, #checkboxRevise').prop('checked', false);
                    $("#checkboxReturnPrev, #checkboxRevise").attr('disabled', false);

                    $('#TBReturnRemarks').val('');
                    $('.modal').modal('hide');
                    dtGetPRs.ajax.reload();
                    signalR.server.notifyUser();
                    Swal.fire(
						'Message!',
						'You have successfully returned PR to concerned Division!',
						'success'
					);
                }
            });
        }
    });

    $('#btnSubmitPR').click(function () {
        var dt = dtGetPRs.row({ selected: true }).data();
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
            data: {
                log: Log,
                PRNumber: $('#TBPRNumber').val(),
                PRDate: $('#TBPRDate').val(),
                ForRevision: false
            },
            success: function (res) {
                dtGetPRs.ajax.reload();
                if (res.success) {

                    Swal.fire(
						'Prompt Message',
						res.message,
						'success'
					);
                    $('#btnSubmitPR').attr('disabled', false);
                    signalR.server.notifyUser();
                    signalR.server.desktopNotification(dt.PurchaseRequestID);
                    $('#TBPRDate, #TBPRNumber').val('');
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

function GeneratePO(id) {
    var dtPOItems = $('#dtPOItems').DataTable({
        destroy: true,
        responsive: true,
        select: true,
        ajax: {
            "url": "/ManagePR/GetPurchaseOrders?&PurchaseRequestID=" + id
        },
        columns: [{
                data: "PurchaseOrderID",
                visible: false,
                title: "PurchaseOrderID"
            },
			{
			    data: "PRNumber",
			    title: "PO Number"
			},
			{
			    data: "SupplierName",
			    title: "Supplier Name"
			},
			{
			    data: "Purpose",
			    title: "Purpose"
			},
			{
			    data: "Amount",
			    title: "Amount"
			}
        ],
        initComplete: function (setting, json) {

        }
    }).on('select', function (e, dt, type, indexes) {
        var dt = $('#dtPOItems').DataTable().row({ selected: true }).data();
        $("#hidPurchaseOrderID").val(dt.PurchaseOrderID);
    }).on('deselect', function (e, dt, type, indexes) {
        $("#hidPurchaseOrderID").val(0);
    });
}