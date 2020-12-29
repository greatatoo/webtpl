//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should set the same number of columns in 'ajax.data', 'option.columns' and thead.th .
var usersDt = $('#dashboard-users').DataTable({
    "language": {
        "processing": trans('datatable.processing'),
        "loadingRecords": trans('datatable.loadingRecords'),
        "lengthMenu": trans('datatable.lengthMenu'),
        "zeroRecords": trans('datatable.zeroRecords'),
        "info": trans('datatable.info'),
        "infoEmpty": trans('datatable.infoEmpty'),
        "infoFiltered": trans('datatable.infoFiltered'),
        "search": trans('datatable.search'),
        "paginate": {
            "first": trans('datatable.paginate.first'),
            "previous": trans('datatable.paginate.previous'),
            "next": trans('datatable.paginate.next'),
            "last": trans('datatable.paginate.last')
        },
        "aria": {
            "sortAscending": trans('datatable.aria.sortAscending'),
            "sortDescending": trans('datatable.aria.sortDescending')
        },
        "select": {
            "1": trans('datatable.select.1'),
            "2": trans('datatable.select.2'),
            "_": trans('datatable.select._')
        }
    },
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
            "width": "1px",
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
                var isActive = parseInt(data, 10) ? true : false;
                return '<i title="' + (isActive ? trans('dashboard.enabled') : trans('dashboard.disabled')) + '" class="' + (isActive ? 'icon-checkmark-circle2 text-success' : 'icon-close2 text-danger') + '"></i>';
            }
        },
        {
            "data": "created_at",
            "render": function (dateStr) {
                const zeroPad = (num, places) => String(num).padStart(places, '0');
                var d = new Date(Date.parse(dateStr));
                var yr = d.getFullYear();
                var mon = zeroPad(d.getMonth() + 1, 2);
                var day = zeroPad(d.getDate(), 2);
                return '<span title="' + dateStr + '">' + yr + '-' + mon + '-' + day + '</span>';
            }
        },
    ],
    "paging": true,
    "ordering": false,
    "info": true,
    "searching": true,
    "stateSave": true,
    "scrollX": true,
    "searchDelay": 800
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
    })
    .on('hidden.bs.modal', function () {
        $('.tf-account', this).val('');
    });

//When textfield account is pressed, click ok button.
$('#dashboard-user-add-modal .tf-account')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#dashboard-user-add-modal .btn-ok').click();
        }
    });

//When ok button is pressed in user-add modal...
$('#dashboard-user-add-modal .btn-ok')
    .click(function () {
        var account = $.trim($('#dashboard-user-add-modal .tf-account').val());
        if (!account) {
            $('#dashboard-user-add-modal .tf-account').focus();
            return false;
        }

        $.ajax({
            url: '/rest/user',
            type: 'post',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                account: account,
                password: window.util.randStr(6)
            },
            success: function (data) {
                window.location.href = "/dashboard/users/" + data.id;
                // usersDt.ajax.reload();
            },
            error: function (xhr) {

            }
        });
    });