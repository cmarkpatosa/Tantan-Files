
$(document).ready(function () {
    GetItems();
});


function GetItems() {
    var dtGetPRs = $("#dtItemList").DataTable({
        destroy: true,
        responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        //order: [[0, "asc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/PropertyManagement/GetItems" },
        autoWidth: true,
        columns:
            [
                { data: "ItemID", visible: false, width: '5px' },
                { data: "ItemName", title: "ItemName", sClass: "text-center" },
                { data: "Description", title: "Description", sClass: "text-center" },
                { data: "Brand", title: "Brand", sClass: "text-center" },
                { data: "Model", title: "Model", sClass: "text-center" },
                { data: "Quantity", title: "Quantity", sClass: "text-center" },
                {
                    data: "", title: "", orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<a href=""  data-toggle="modal" data-target="#modal-submit"><i class="nav-icon far fa-play-circle" title="Submit"></i></a>' +
                                      '<a href=""><i class="nav-icon fas fa-eye" title="View"></i></a>' +
                                      '<a href=""  data-toggle="modal" data-target="#modal-create"><i class="nav-icon fas fa-pencil-alt" title="Edit"></i></a>';
                        //'<a href=""><i class="nav-icon fas fa-trash-alt" title="Delete"></i></a>';
                        if (row.Status != 'Preparing...') {
                            buttons = '<a href=""><i class="nav-icon fas fa-eye" title="View"></i></a>&nbsp;';
                        }
                        return buttons
                    }
                }
            ],
        'columnDefs': [
            {
                'targets': 0,
                'checkboxes': {
                    'selectRow': true
                }
            }
        ],
        'select': {
            'style': 'multi'
        },
        initComplete: function (setting, json) {
            $('#dtItemList tbody').off().on('click', 'tr', function (e) {
                $(this).parent().find("tr").removeClass("dtactive");
                if (!$(this).hasClass("dtactive")) {
                    $(this).addClass("dtactive");
                }
                else {
                    $(this).removeClass("dtactive");
                }
            });
        }
    });
}

function GetItemByID(id) {
    $.ajax({
        url: '../ManagePR/GetPurchaseRequest?&purchaseRequestID=' + id,
        type: 'post',
        contentType: "application/json",
        success: function (result) {
            if (result != "null") {
                var data = parseAndResolve(result);
                fnSupplytoFields("#frmSaveItem", result, "Item");
            } else {
                $("#frmSaveItem").trigger("reset");
            }
        }
    });
}