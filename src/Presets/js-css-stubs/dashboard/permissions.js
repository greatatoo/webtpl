//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should set the same number of columns in 'ajax.data', 'option.columns' and thead.th .
var permissionsDt = $('#dashboard-permissions').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "/rest/datatable",
        "type": "POST",
        "data": {
            "_token": $('meta[name="csrf-token"]').attr('content'),//For Laravel VerifyCsrfToken Middleware 
            "table": "permissions",
            "primary_key": "id",
            "columns": [
                { "db": "id", "dt": "id" },
                { "db": "name", "dt": "name" },
                { "db": "slug", "dt": "slug" },
            ]
        }
    },
    "columns": [
        {
            "data": "id",
            "width": "1%",
            "render": function (data) {
                return '<i class="icon-users"></i>';
            }
        },
        { "data": "name" },
        { "data": "slug" }
    ],
    "paging": true,
    "ordering": true,
    "info": true,
    "searching": true,
    "stateSave": true,
    "scrollX": true
});

//Make clickable for each row of table dashboard permissions.
$('#dashboard-permissions tbody')
    .on('click', 'tr', function () {
        var tr = $(this);
        var row = permissionsDt.row(tr);
        var permissionId = row.data().id;

        window.location.href = "/dashboard/permissions/" + permissionId;
    });

//When permission-add moda is shown...
$('#dashboard-permission-add-modal')
    .on('shown.bs.modal', function () {
        $('.tf-name', this).focus();
    })
    .on('hidden.bs.modal', function () {
        $('.tf-name, .tf-slug', this).val('');
    });

//When textfield is pressed, click ok button.
$('#dashboard-permission-add-modal .tf-name')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#dashboard-permission-add-modal .tf-slug').focus();
        }
    });
$('#dashboard-permission-add-modal .tf-slug')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#dashboard-permission-add-modal .btn-ok').click();
        }
    });

//When ok button is pressed in permission-add modal...
$('#dashboard-permission-add-modal .btn-ok')
    .click(function () {
        var name = $.trim($('#dashboard-permission-add-modal .tf-name').val());
        var slug = $.trim($('#dashboard-permission-add-modal .tf-slug').val());
        if (!name) {
            $('#dashboard-user-add-modal .tf-name').focus();
            return false;
        }
        if (!slug) {
            $('#dashboard-user-add-modal .tf-slug').focus();
            return false;
        }

        $.ajax({
            url: '/rest/permission',
            type: 'post',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                name: name,
                slug: slug
            },
            success: function (data) {
                window.util.notify('Permission ' + name + ' has been created.');
                permissionsDt.ajax.reload();
            },
            error: function (xhr) {

            }
        });
    });