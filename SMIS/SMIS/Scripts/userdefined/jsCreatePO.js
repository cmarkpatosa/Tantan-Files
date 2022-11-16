$(document).ready(function () {
    $('#TBPODate').inputmask('mm/dd/yyyy', { 'placeholder': 'mm/dd/yyyy' });
    //Initialize Select2 Elements
    $('.select2').select2()
    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    });
    $('#TBDate, #TBItemName').attr('disabled', true);

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
                { data: "Amount", title: "Amount", sClass: "text-center",
                    render: function (data, type, row, meta) {
                        return `<h6>` + data + `</h6>`;
                    }
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
        select:true,
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
        $.ajax({
            url: '/ManagePR/GetPurchaseRequest?&purchaseRequestID=' + this.value + '&type=PO', // PurchaseRequestID
            type: 'GET',
            success: function (result) {
                $('#SupplierID').val(-1).trigger('change');
                var purchaseRequest = JSON.parse(result.PurchaseRequest)[0];
                $('#TBPurpose').val(purchaseRequest.Purpose);
                $('#hidPurchaseRequestID').val(purchaseRequest.PurchaseRequestID);
                if (purchaseRequest.SupplierID !== 0) {
                    $('#SupplierID').val(purchaseRequest.SupplierID).trigger('change');
                    $('#SupplierID').attr('disabled', true);
                } else {
                    $('#SupplierID').attr('disabled', false);
                }

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
                    total += purchaseRequestDetail.TotalCost;
                });

                $('#TBTotal').val(formatter.format(total).replace("$", ""));
            }
        });
    });

    $('#btnCreatePO').click(function () {
        var list = [];
        dtItems.rows().every(function () {
            var d = this.data();
            var PurchaseOrderDetail = {
                PurchaseOrderDetailID: 0,
                PurchaseOrderID: 0,
                ActivityDate: d[2],
                ItemName: d[3],
                Specification: d[4],
                Unit: d[5],
                Quantity: d[6],
                UnitCost: (d[7]).replace(/,/g, '')
            }
            list.push(PurchaseOrderDetail);

            d.counter++; // update data source for the row
            this.invalidate(); // invalidate the data DataTables has cached for this row
        });

        var PurchaseOrder = {
            PurchaseRequestID: $('#hidPurchaseRequestID').val(),
            PurchaseOrderDate: $("#TBPODate").val(),
            SupplierID: $('#SupplierID').val(),
            ModeofProcurement: $('#TBModeofProcurement').val(),
            PlaceofDelivery: $('#TBPlaceofDelivery').val(),
            DateofDelivery: $('#TBDateofDelivery').val(),
            Amount: $('#TBTotal').val().replace(/,/g, ''),
            PurchaseOrderDetails: list
        }

        if (PurchaseOrder.PurchaseRequestID == "" ||
            PurchaseOrder.SupplierID == "") {
            Swal.fire(
                                 'Prompt Message',
                                 "kindly fill up required fields",
                                 'warning'
                           );
            return false;
        }

        var total = formatter.format($('#TBTotal').val().replace(/,/g, '')).replace("$", "");
        Swal.fire({
            title: 'Create Purchase Order',
            text: "Saving Purchase Order for PR Number " + $('#PurchaseRequestID option:selected').text() + " with an Amount of " + total,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Save Changes!'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: 'POST',
                    url: '/ManagePR/SavePurchaseOrder',
                    data: { purchaseOrder: PurchaseOrder },
                    success: function (res) {
                        if (res.success) {
                            Swal.fire(
                                  'Prompt Message',
                                  res.message,
                                  'success'
                            );
                            signalR.server.notifyUser();
                            dtGetPOs.ajax.reload();
                            $("input").val("");
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

    $("#btnAddtoList").click(function () {
        var dt = dtItems.rows(rowClick).data()[0];
        if ($('#TBUnit').val() != "" &&
            $('#TBItemQuantity').val() != "" &&
            $('#TBItemCost').val() != "") {
            dt[0] = 0;
            dt[1] = $('#hidPurchaseRequestID').val();
            dt[2] = $('#TBDate').val();
            dt[3] = $('#TBItemName').val();
            dt[4] = $('#TBSpecification').val();
            dt[5] = $('#TBUnit').val();
            dt[6] = $('#TBItemQuantity').val();
            dt[7] = formatter.format($('#TBItemCost').val()).replace("$", "");
            dtItems.rows(rowClick).data(dt);
            var page = dtItems.page.info().page;
            dtItems.draw();
            dtItems.page(page).draw(false);

            $("#modal-create").modal('hide');
            var total = 0;
            dtItems.rows().every(function () {
                var d = this.data();
                total += d[6] * Number(d[7].replace(/,/g, ''));
                d.counter++; // update data source for the row
                this.invalidate(); // invalidate the data DataTables has cached for this row
            });

            var total = formatter.format(total).replace("$", "");
            $('#TBTotal').val(total);
        } else {
            Swal.fire(
                                'Prompt Message!',
                                'Fields mark with (<span style="color:red">*</span>) must not be blank!',
                                'warning'
                              );
        }
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
            title: "Unit Cost", sortable: false,
            render: function (data, type, row, meta) {
                return `<a href="#" onclick="UpdateItem(this,` + meta.row + `)" style="font-size: 18px;">` + data + `</a>`;
            }
        },
        {
            title: "Action", sortable: false, width: '20px', sClass: "text-center",
            render: function (data, type, row, meta) {
                return `<a href="#" onclick="RemoveItem(this,` + row[0] + `)" class="text-danger"><i class="fas fa-trash-alt" style="font-size: 20px"></i></a>`;
            }
        },
        ],
        //dom: 'Bfrtip',
        //select: true,
        //buttons: [
        //    {
        //        text: '<i class="nav-icon fas fa-pencil-alt" title="Edit"></i> Edit',
        //        action: function (e, dt, node, config) {
                    
        //        }
        //    },
        //    {
        //        text: '<i class="far fa-trash-alt"  title="Delete"></i> Remove',
        //        action: function (e, dt, node, config) {
        //            if (dtItems.rows({ selected: true }).count() > 0) {
        //                Swal.fire({
        //                    title: 'Are you sure?',
        //                    text: "You won't be able to revert this!",
        //                    icon: 'warning',
        //                    showCancelButton: true,
        //                    confirmButtonColor: '#3085d6',
        //                    cancelButtonColor: '#d33',
        //                    confirmButtonText: 'Yes, Confirm delete!'
        //                }).then((result) => {
        //                    if (result.value) {
        //                        dtItems.row({ selected: true }).remove().draw();
        //                        //dtItems.row(dtItems.row(".dtactive")).remove().draw();
        //                        var total = 0;
        //                        dtItems.rows().every(function () {
        //                            var d = this.data();
        //                            total += d[6] * Number(d[7].replace(",",""));
        //                            d.counter++; // update data source for the row
        //                            this.invalidate(); // invalidate the data DataTables has cached for this row
        //                            $('#TBTotal').val(formatter.format(total).replace("$", ""));
        //                        });
        //                    }
        //                });
        //            } else {
        //                Swal.fire(
        //                  'Message!',
        //                  'Please select record to remove!',
        //                  'warning'
        //                );
        //            }
        //        }
        //    },
        //],
        initComplete: function (setting, json) {
          
        }
    });

});


var rowClick;
function RemoveItem(elem, rowIndex) {  
    Swal.fire({
        title: 'Confirmation Message',
        text: "Are you sure to remove item? You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm!'
    }).then((result) => {
        if (result.value) {
            var table = $("#dtItems").DataTable();
            table
                .rows(function (idx, data, node) {
                    return data[0] === rowIndex;
                })
                .remove()
                .draw(false);

            ReloadTotalAmount();
            Swal.fire(
              'Deleted!',
              'Item successfully deleted.',
              'success'
            )
        }
    })
}
function UpdateItem(elem, rowIndex) {
    var dt = $("#dtItems").DataTable().rows(rowIndex).data()[0];
    rowClick =rowIndex;
    if (dt !== undefined) {
        $("#modal-create").modal('show');
        $('#TBDate').val(dt[2]);
        $('#TBItemName').val(dt[3]);
        $('#TBSpecification').val(dt[4]);
        $('#TBUnit').val(dt[5]);
        $('#TBItemQuantity').val(Number(dt[6]));
        $('#TBItemCost').val(Number(dt[7].replace(/,/g, '')));
        if ($('#SupplierID').prop('disabled')) {
            $('#TBItemCost, #TBItemQuantity, #TBUnit').prop('disabled', true);
        } else {
            $('#TBItemCost, #TBItemQuantity, #TBUnit').prop('disabled', false);
        }
        ReloadTotalAmount()
    } else {
        Swal.fire(
          'Message!',
          'Please select record to edit!',
          'warning'
        );
    }
}

function ReloadTotalAmount() {
    var dtItems = $("#dtItems").DataTable();
    var total = 0;
    dtItems.rows().data().each(function (e) { 
        total += e[6] * Number((e[7]).replace(/,/g, '')).toFixed(2);
    });
    $('#TBTotal').val(formatter.format(total).replace("$", ""));
}