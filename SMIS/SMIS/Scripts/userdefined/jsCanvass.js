$(document).ready(function () {
    $('#TBCanvassDate').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' });
    //Initialize Select2 Elements
    $('.select2').select2()
    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    });
    $('#TBDate, #TBItemName, #TBSpecification').attr('disabled', true);

    var dtGetPOs = $("#dtPOList").DataTable({
        destroy: true,
        responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        order: [[1, "desc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/ManagePR/GetPOs" },
        autoWidth: true,
        columns:
            [
                { data: "PurchaseRequestID", visible: false },
                { data: "PurchaseOrderID", visible: false },
                { data: "TransactionTypeID", visible: false },
                { data: "PRNumber", title: "PR No.", sClass: "text-center", width: '7%' },
                {
                    data: "DatePRPrepared", title: "Prepared", sClass: "text-center"
                },
                { data: "SupplierName", title: "Supplier", sClass: "text-center" },
                { data: "ModeofProcurement", title: "Mode", sClass: "text-center" },
                { data: "DivisionName", title: "Concerned Division", sClass: "text-center" },
                { data: "Purpose", title: "Purpose", sClass: "text-center", width: '35%' },
                { data: "TransactionType", title: "Transaction Type", sClass: "text-center" },
                {
                    data: "Amount", title: "Amount",
                    sClass: "text-right"
                },
            ],
        //'columnDefs': [
        //    {
        //        'targets': 0,
        //        'checkboxes': {
        //            'selectRow': true
        //        }
        //    }
        //],
        //select: {
        //    style: 'single'
        //},
        dom: 'Bfrtip',
        select: true,
        buttons: [
            {
                text: '<i class="fas fa-print"  title="Generate Report"></i> Print',
                action: function (e, dt, node, config) {
                    var dt = dtGetPOs.row({ selected: true }).data();

                    window.open("/ManagePR/GenerateReport2?purchaseOrderID=" + dt.PurchaseOrderID + "&reportType=PO", "_blank");
                }
            },
            {
                text: '<i class="fas fa-trash-alt"  title="Generate Report"></i> Delete Purchase Order',
                action: function (e, dt, node, config) {
                    if (dtGetPOs.rows({ selected: true }).count() == 0) {
                        Swal.fire(
                                'Prompt Message',
                                "Please select record to delete!",
                                'success'
                            );
                        return false;
                    }
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
                            var dt = dtGetPOs.row({ selected: true }).data();
                            $.ajax({
                                url: '/ManagePR/DeletePurchaseOrder?&purchaseOrderID=' + dt.PurchaseOrderID, // PurchaseRequestID
                                type: 'GET',
                                success: function (res) {
                                    Swal.fire(
                                        'Prompt Message',
                                        res.message,
                                        'success'
                                    );
                                    dtGetPOs.ajax.reload();
                                }
                            });
                        }
                    });


                }
            },
        ],
        initComplete: function (setting, json) {

        }
    });

    $('#PurchaseRequestID').on('change', function (e) {
        $('#TBTotal').val('0.00');
        $.ajax({
            url: '/ManagePR/GetPurchaseRequest?&purchaseRequestID=' + this.value, // PurchaseRequestID
            type: 'GET',
            success: function (result) {
                var purchaseRequest = JSON.parse(result.PurchaseRequest)[0];
                $('#TBPurpose').val(purchaseRequest.Purpose);
                $('#hidPurchaseRequestID').val(purchaseRequest.PurchaseRequestID);
                $("#TransactionTypeID").val(purchaseRequest.TransactionTypeID);
                var dtItems = $("#dtItems").DataTable();
                dtItems.clear().draw();
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
                });

                var total = 0;
                $("#dtItems").DataTable().rows().every(function () {
                    var d = this.data();
                    total += (d[6]) * Number((d[7]).replace(/,/g, '')).toFixed(2);
                    d.counter++; // update data source for the row
                    this.invalidate(); // invalidate the data DataTables has cached for this row
                });
                total = formatter.format(Number(total).toFixed(2)).replace("$", "");
                $('#TBTotal').val(total);
            }
        });
    });

    $('#btnCreateCanvass').click(function () {
        var list = [];
        dtItems.rows().every(function () {
            var d = this.data();
            var PurchaseRequestDetail = {
                PurchaseRequestDetailID: d[0],
                UnitPrice: (d[7]).replace(/,/g, '')
            }
            list.push(PurchaseRequestDetail);
            d.counter++; // update data source for the row
            this.invalidate(); // invalidate the data DataTables has cached for this row
        });

        var Canvass = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            DateCanvass: $("#TBCanvassDate").val(),
            SupplierID: $('#SupplierID').val(),
            Canvasser: $('#TBCanvasser').val(),
            CanvassDetails: list
        }

        if (Canvass.PurchaseRequestID == "" ||
            Canvass.SupplierID == "" || 
            Canvass.DateCanvass == "") {
            Swal.fire(
                'Prompt Message',
                "kindly fill up required fields",
                'warning'
            );
            return false;
        }

        var total = formatter.format($('#TBTotal').val().replace(/,/g, '')).replace("$", "");
        Swal.fire({
            title: 'Create Canvass',
            text: "Saving Canvass Form for PR Number " + $('#PurchaseRequestID option:selected').text() + " with an Amount of " + total,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Save Changes!'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: 'POST',
                    url: '/ManagePR/SaveCanvass',
                    data: { canvass: Canvass },
                    success: function (res) {
                        if (res.success) {
                            Swal.fire(
                                  'Prompt Message',
                                  res.message,
                                  'success'
                            );
                            signalR.server.notifyUser();
                            $("input").val("");
                            $("textarea").val('');
                            $("select").val(-1);
                            $('.select2').val(null).trigger('change');
                            $("#dtCanvass").DataTable().ajax.reload();
                        } else {
                            Swal.fire(
                                  'Prompt Message',
                                  res.message,
                                  'error'
                            );
                        }
                    },
                    error: function (request, error) {
                        alert(" Can't do because: " + error);
                    }
                });
            }
        });
    });


    var dtItems = $("#dtItems").DataTable({
        searching: true,
        bPaginate: true,
        ordering: false,
        columns: [
            { title: "PurchaseRequestDetailID", visible: false, sortable: false },
            { title: "PurchaseRequestID", visible: false, sortable: false },
            { title: "Activity Date", sortable: false },
            { title: "Item Name", sortable: false },
            { title: "Specification", sortable: false },
            { title: "Unit", sortable: false },
            { title: "Quantity", sortable: false },
            {
                title: "Unit Price", sortable: false, className: "text-right",
                render: function (data, type, row, meta) {
                    return `<a href="#" onclick="SetUnitPrice(this, ` + meta.row + `);" style="font-size: 18px;">` + data + `</a>`;
                }
            },
        ],
        select: false,
        initComplete: function (setting, json) {

        }
    });

    var dtGetCanvass = $("#dtCanvass").DataTable({
        destroy: true,
        responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        order: [[1, "desc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/ManagePR/GetCanvass" },
        autoWidth: true,
        columns:
            [
                { data: "PurchaseRequestID", visible: false },
                { data: "Prepared", title: "Prepared", sClass: "text-center" },
                //{
                //    data: "DateCanvass", title: "DateCanvass", sClass: "text-center"
                //},
                //{ data: "SupplierName", title: "Supplier", sClass: "text-center" },
                //{ data: "Canvasser", title: "Canvasser", sClass: "text-center" },
                { data: "PRNumber", title: "PR Number", sClass: "text-center" },
                { data: "Purpose", title: "Purpose", sClass: "text-center" },
                {
                    data: "Amount", title: "PR Amount", sortable: false, className: "text-right",
                    render: function (data, type, row, meta) {
                        return `<h6>` + formatter.format(Number(data).toFixed(2)).replace("$", "") + `</h6>`;
                    }
                }
            ],
        dom: 'Bfrtip',
        select: true,
        buttons: [
            {
                text: '<i class="fas fa-clipboard-list"  title="View Canvass"></i> View List of Canvass',
                action: function (e, dt, node, config) {
                    var dt = dtGetCanvass.row({ selected: true }).data();
                    $("#modal-canvass").modal('show');
                    $("#PRAmount").html(formatter.format(Number(dt.Amount).toFixed(2)).replace("$", ""));
                    var dtGetCanvassList = $("#dtCanvassList").DataTable({
                        destroy: true,
                        responsive: true,
                        search: true,
                        //"serverSide": true,
                        //searching: false, paging: true, info: false,
                        order: [[1, "desc"]],
                        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
                        ajax: { "url": "/ManagePR/GetCanvassList?purchaseRequestID=" + dt.PurchaseRequestID },
                        autoWidth: true,
                        columns:
                            [
                                { data: "CanvassID", visible: false },
                                { data: "SupplierName", title: "Supplier", sClass: "text-center" },
                                {
                                    data: "DateCanvass", title: "Canvass Date", sClass: "text-center"
                                },
                                { data: "Canvasser", title: "Canvasser", sClass: "text-center" },
                                {
                                    data: "Total", title: "Canvass Amount", sortable: false, className: "text-right",
                                    render: function (data, type, row, meta) {
                                        return `<h6>` + formatter.format(Number(data).toFixed(2)).replace("$", "") + `</h6>`;
                                    }
                                }
                            ],
                        dom: 'Bfrtip',
                        select: true,
                        buttons: [
                            {
                                text: '<i class="fas fa-shopping-cart"  title="View Canvass"></i> View Canvass Items',
                                action: function (e, dt, node, config) {
                                    var dt = dtGetCanvassList.row({ selected: true }).data();
                                    $("#modal-items").modal('show');
                                    $("#modal-items").find('h4').html('Canvass Items | Total Amount: ' + formatter.format(Number(dt.Total).toFixed(2)).replace("$", ""));
                                    $('#dtPRItems').DataTable({
                                        destroy: true,
                                        responsive: true,
                                        ajax: { "url": "/ManagePR/GetCanvassItems?&canvassID=" + dt.CanvassID },
                                        columns: [
                                                { data: "CanvassDetailID", title: "CanvassDetailID", visible: false },
                                                { data: "ActivityDate", title: "Activity Date" },
                                                { data: "ItemName", title: "Item Name" },
                                                { data: "Specification", title: "Specification" },
                                                { data: "Unit", title: "Unit" },
                                                { data: "Quantity", title: "Quantity" },
                                                {
                                                    data: "UnitPrice", title: "Unit Price",
                                                    render: function (data, type, row, meta) {
                                                        return `<h6>` + formatter.format(Number(data).toFixed(2)).replace("$", "") + `</h6>`;
                                                    }
                                                },
                                                {
                                                    data: "Total", title: "Total",
                                                    render: function (data, type, row, meta) {
                                                        return `<h6>` + formatter.format(Number(data).toFixed(2)).replace("$", "") + `</h6>`;
                                                    }
                                                },
                                        ],
                                        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
                                    });
                                }
                            },
                            {
                                text: '<i class="fas fa-trash-alt"  title="Delete Canvass"></i> Delete',
                                className: 'btn-danger',
                                action: function (e, dt, node, config) {
                                    var dt = dtGetCanvassList.row({ selected: true }).data();
                                    $.ajax({
                                        url: '/ManagePR/DeleteCanvass?&canvassID=' + dt.CanvassID, // PurchaseRequestID
                                        type: 'GET',
                                        success: function (res) {
                                            Swal.fire(
                                                'Prompt Message',
                                                res.message,
                                                'success'
                                            );
                                            dtGetCanvassList.ajax.reload();
                                        }
                                    });
                                },
                            },
                        ],
                        initComplete: function (setting, json) {

                        }
                    });
                    //window.open("/ManagePR/GenerateReport2?purchaseOrderID=" + dt.PurchaseOrderID + "&reportType=PO", "_blank");
                }
            },
            {
                text: '<i class="fas fa-print"  title="Abstract of Canvass"></i> Print Abstract of Canvass',
                className: 'btn-info',
                action: function (e, dt, node, config) {
                    var dt = dtGetCanvass.row({ selected: true }).data();
                    $.ajax({
                        url: '/ManagePR/GetSuppliers?&PurchaseRequestID=' + dt.PurchaseRequestID, // PurchaseRequestID
                        type: 'GET',
                        success: function (res) {
                            $("#modal-canvassform").modal('show');
                            $("#modal-canvassform").html(res);
                            $("#modal-abstractofcanvass").modal('show');
                            $("#btnGenerateAbstractOfCanvass").off().click(function () {
                                if ($("#ACSupplierID option:selected").text().trim() == '') {
                                    Swal.fire(
                                                'Prompt Message',
                                                'Please select supplier information...',
                                                'warning'
                                            );
                                    return false;
                                }
                                var param = $("#ACSupplierID option:selected").text().trim() + "|" + $("#TBTimeOpened").val() + "|" + $("#TBACT").val() + "|" + $("#TBACD").val();
                                window.open("/ManagePR/GenerateReport?purchaseRequestID=" + dt.PurchaseRequestID + "&reportType=AbstractOfCanvass" + "&param=" + param, "_blank");
                            });
                        }
                    });
                }
            },
        ],
    });
});



function SetUnitPrice(elem, rowIndex) {
    var d = $("#dtItems").DataTable().rows(rowIndex).data(); // get data from datatable
    Swal.fire({
        title: 'Enter Amount',
        html:
        '<div class="form-group text-left"><label>Specification</label><textarea rows="4" id="TBSpecification" class="form-control" onkeyup="saveUnitCost(event)">' + d[0][4] + '</textarea>' +
        '<div class="form-group"><label>Cost</label><input type="number" id="TBAmount" class="form-control" value="' + elem.innerHTML + '" onkeyup="saveUnitCost(event)"></div>',
        showCancelButton: true,
        confirmButtonText: 'Save Changes',
        showLoaderOnConfirm: true,
        preConfirm: (input) => {
            if (formatter.format(Number($("#TBAmount").val()).toFixed(2)).replace("$", "") !== "0.00") {
                //dt[7] = input;
                //dtItems.row({ selected: true }).data(dt);
                //var page = dtItems.page.info().page;
                //dtItems.draw();
                //dtItems.page(page).draw(false);
                elem.innerHTML = formatter.format(Number($("#TBAmount").val()).toFixed(2)).replace("$", "");
                          
                d[0][7] = elem.innerHTML; // set new value to unit price

                $("#dtItems").DataTable().rows(rowIndex).data(d).draw(); // updates datatable data

                var total = 0;
                $("#dtItems").DataTable().rows().every(function () {
                    var d = this.data();
                    total += (d[6]) * Number((d[7]).replace(/,/g, '')).toFixed(2);
                    d.counter++; // update data source for the row
                    this.invalidate(); // invalidate the data DataTables has cached for this row
                });
                total = formatter.format(Number(total).toFixed(2)).replace("$", "");
                $('#TBTotal').val(total);
                return true;
            } else {
                Swal.showValidationMessage(
                    'Please Input Unit Price!'
                  )
            }
        },
        onOpen: function () {
            $("#TBAmount").select();
        },
        allowOutsideClick: () => !Swal.isLoading()
    });
}

function saveUnitCost(event) {
    if (event.keyCode == 13) {
        $(".swal2-confirm").click();
    }
}