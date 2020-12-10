//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should set the same number of columns in 'ajax.data', 'option.columns' and thead.th .
var usersDt = $('#dashboard-users').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "/rest/datatable",
        "type": "POST",
        "data": {
            "_token": $('meta[name="csrf-token"]').attr('content'),//For Laravel VerifyCsrfToken Middleware 
            "table": "users",
            "primary_key": "id",
            "columns": [
                { "db": "id", "dt": "id" },
                { "db": "account", "dt": "account" },
                { "db": "name", "dt": "name" },
                { "db": "email", "dt": "email" },
                { "db": "created_at", "dt": "created_at" },
                { "db": "active", "dt": "active" },
            ]
        }
    },
    "columns": [
        {
            "data": "id",
            "render": function (data) {
                return '<i class="icon-user"></i>';
            }
        },
        { "data": "account" },
        { "data": "name" },
        { "data": "email" },
        {
            "data": "active",
            "render": function (data, type) {
                return '<i class="'+(data?'icon-checkmark-circle2':'icon-close2')+'"></i>';
            }
        },
        { "data": "created_at" },
    ],
    "paging": true,
    "ordering": false,
    "info": true,
    "searching": true,
    "stateSave": true,
    "scrollX": true
});

//Make clickable for each row of table dashboard users.
$('#dashboard-users tbody')
    .on('click', 'tr', function () {
        var tr = $(this);
        var row = usersDt.row(tr);
        var userId = row.data().id;

        window.location.href = "/dashboard/users/" + userId;
    });

//When user-add moda is shown...
$('#dashboard-user-add-modal')
    .on('shown.bs.modal', function () {
        $('.tf-account', this).focus();
    });

//When ok button is pressed in user-add modal...
$('#dashboard-user-add-modal .btn-ok')
    .click(function(){
        var account=$.trim($('#dashboard-user-add-modal .tf-account').val());
        if(!account){
            $('#dashboard-user-add-modal .tf-account').focus();
            return false;
        }
        console.log(account);

        $.ajax({
            url: '/rest/user',
            type: 'post',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                account: account,
                password: util.randStr(6)
            },
            success: function (data) {
                console.log(data);
            },
            error: function (xhr) {
                
            }
        });
    });