$(document).ready(function () {
    $(".chk").click(function () {
        if ($(this).prop("checked")) {
            $('input').prop("checked", false);
            $('#dtPrList').DataTable().columns(2)
                .search($(this).siblings().text().trim())
                .draw();
            $(this).prop("checked", true);
        } else {
            $('#dtPrList').DataTable().columns(2)
                    .search('')
                    .draw();
        }
    });

    GetPRs();
});



function GetPRs() {
    var dtGetPRs = $("#dtPrList").DataTable({
        destroy: true,
        //responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        //order: [[0, "asc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/ManagePR/CancelledPRs" },
        autoWidth: false,
        scrollX: true,
        select: true,
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
                //{ data: "DivisionName", title: "Concerned Division", sClass: "text-center", visible: true },
                //{ data: "Status", title: "Status", sClass: "text-center" },
                { data: "Remarks", title: "Remarks", sClass: "text-center" },
                { data: "PurchaseRequestID", visible: false },
                { data: "TransactionTypeID", visible: false },
                { data: "DatePrepared", title: "Submitted", sClass: "text-center", visible: false },
                { data: "Purpose", title: "Purpose", sClass: "text-center", width: '80%' },
                { data: "TransactionType", title: "Transaction Type", sClass: "text-center" },
                { data: "Amount", title: "Amount", sClass: "text-right",
                    render: function (data, type, row, meta) {
                        return `<h6>` + data + `</h6>`;
                    }
                },
                //{ data: "Supplier", title: "Supplier", sClass: "text-center" },
            ],
        columnDefs: [
            {
                width: "10%", targets: [0, 1, 2, 6, 7]
            },
        ],
        //select: {
        //    style: 'multi'
        //},
        dom: 'Bfrtip',
        buttons: [
             //{
             //    text: '<i class="fas fa-print"></i> Print',
             //    action: function (e, dt, node, config) {
             //        var dt = dtGetPRs.row({ selected: true }).data();
             //        if (dt !== undefined) {

             //            Swal.fire({
             //                title: 'Select Report to Generate',
             //                input: 'select',
             //                inputOptions: {
             //                    //PR: 'Purchase Request Report',
             //                    //RIS: 'Requisition and Issue Slip',
             //                    //Canvass: 'Canvass Form',
             //                    //AbstractOfCanvass: 'Abstract of Canvass',
             //                    PRHistory: 'PR History',
             //                },
             //                inputPlaceholder: 'Select a report',
             //                showCancelButton: true,
             //                inputValidator: (value) => {
             //                    window.open("/ManagePR/GenerateReport?purchaseRequestID=" + dt.PurchaseRequestID + "&reportType=" + value, "_blank");
             //                }
             //            });
             //        } else {
             //            Swal.fire(
             //                     'Message!',
             //                     'Please select record to generate report!',
             //                     'warning'
             //                   );
             //        }
             //    }
             //},
             {
                 text: '<i class="fas fa-history"></i> Track PR',
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
                     $('#modal-logs').modal('show');
                 }
             },
             {
                text: '<i class="fas fa-shopping-cart"></i> View PR Items',
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
        ],
        initComplete: function (setting, json) {
            //$('#dtPrList').off().on('page.dt search.dt', function () {
            //    $('#dtPrList tbody tr').parent().find("tr").removeClass("dtactive");
            //});

            //$('#dtPrList tbody').off().on('click', 'tr', function (e) {
            //    var tr = $(this).closest('tr');
            //    var row = dtGetPRs.row(tr);
            //    if (row.child.isShown()) {
            //        // This row is already open - close it
            //        row.child.hide();
            //        tr.removeClass('shown');
            //    }
            //    else {
            //        // Open this row
            //        //row.child(format(row.data())).show();
            //        //tr.addClass('shown');
            //    }

            //    $(this).parent().find("tr").removeClass("dtactive");
            //    if (!$(this).hasClass("dtactive")) {
            //        $(this).addClass("dtactive");
            //    }
            //    else {
            //        $(this).removeClass("dtactive");
            //    }

            //});

        }
    });

    
}