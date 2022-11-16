$(document).ready(function () {
    var dtGetUsers = $("#dtUserList").DataTable({
        destroy: true,
        responsive: true,
        search: true,
        //"serverSide": true,
        //searching: false, paging: true, info: false,
        //order: [[0, "asc"]],
        lengthMenu: [[5, 10, 20, -1], [5, 10, 20, "All"]],
        ajax: { "url": "/User/GetUserList" },
        autoWidth: true,
        columns:
            [
                { data: "UserID", title: "UserID", visible: false, sClass: "text-center", width: '10%' },
                { data: "AccountName", title: "Account Name" },
                { data: "Username", title: "Username" },
                { data: "Password", title: "Password" },
                { data: "DivisionName", title: "Division" },
                { data: "OfficeName", title: "Office" },
                { data: "Role", title: "Role" },
                { data: "DivisionID", visible: false },
                { data: "OfficeID", visible: false },
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
        dom: 'Bfrtip',
        buttons: [
             {
                 text: '<i class="fas fa-user-plus"></i>',
                 action: function (e, dt, node, config) {
                     // Logs
                     $("#modal-user").modal('show');
                     $('input').val('');
                     $('#hidUserID').val(0);
                 }
             },
             {
                 text: '<i class="fas fa-user-edit"></i>',
                 action: function (e, dt, node, config) {
                     // Logs
                     var dt = dtGetUsers.row(".dtactive").data();
                     if (dt !== undefined) {
                         console.log(dt.UserID)
                         $("#modal-user").modal('show');
                         $('#hidUserID').val(dt.UserID);
                         $('#TBAccountName').val(dt.AccountName);
                         $('#TBUsername').val(dt.Username);
                         $('#TBPassword').val(dt.Password);
                         $('#DivisionID').val(dt.DivisionID);
                         $('#OfficeID').val(dt.OfficeID);
                         $('#SRole').val(dt.Role);
                     }
                 }
             },
        ],
        initComplete: function (setting, json) {
            $('#dtUserList').off().on('page.dt', function (e, settings, len) {
                $('#dtUserList tbody tr').parent().find("tr").removeClass("dtactive");
            });

            $('#dtUserList tbody').off().on('click', 'tr', function (e) {
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

    $('#btnSave').click(function () {
        var UserAccount = {
            UserID: $('#hidUserID').val(),
            AccountName: $('#TBAccountName').val(),
            Username: $('#TBUsername').val(),
            Password: $('#TBPassword').val(),
            DivisionID: $('#DivisionID').val(),
            OfficeID: $('#OfficeID').val(),
            Role: $('#SRole').val(),
        }

        $.ajax({
            type: 'POST',
            url: '/User/SaveUser',
            data: { userAccount: UserAccount },
            success: function (res) {
                dtGetUsers.ajax.reload();
                if (res.success) {
                    Swal.fire(
                          'Prompt Message',
                          res.message,
                          'success'
                    );
                    $('#hidUserID').val(0);
                    $('#TBAccountName').val('');
                    $('#TBUsername').val('');
                    $('#TBPassword').val('');
                    $('#DivisionID').val('');
                    $('#OfficeID').val('');
                    $('#SRole').val('');
                    $('#modal-user').modal('hide');
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