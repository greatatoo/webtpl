//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should have the same number columns in 'ajax.data', 'option.columns' and thead.th .
var usersDt = $('#dashboard-users').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "/datatable",
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
                return '';//TODO user icon
            }
        },
        { "data": "account"},
        { "data": "name" },
        { "data": "email" },
        {
            "data": "active",
            "render": function (data, type) {
                return data;
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

$('#dashboard-users tbody').on('click', 'tr', function () {
    var tr = $(this);
    var row = usersDt.row(tr);
    var userId = row.data().id;

    window.location.href = "/dashboard/users/" + userId;
});