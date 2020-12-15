//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should set the same number of columns in 'ajax.data', 'option.columns' and thead.th .
var rolesDt = $('#dashboard-roles').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "/rest/datatable",
        "type": "POST",
        "data": {
            "_token": $('meta[name="csrf-token"]').attr('content'),//For Laravel VerifyCsrfToken Middleware 
            "table": "roles",
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
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": true,
    "scrollX": true
});

//Make clickable for each row of table dashboard roles.
$('#dashboard-roles tbody')
    .on('click', 'tr', function () {
        var tr = $(this);
        var row = rolesDt.row(tr);
        var roleId = row.data().id;

        window.location.href = "/dashboard/roles/" + roleId;
    });

//When role-add moda is shown...
$('#dashboard-role-add-modal')
    .on('shown.bs.modal', function () {
        $('.tf-name', this).focus();
    })
    .on('hidden.bs.modal', function () {
        $('.tf-name, .tf-slug', this).val('');
    });

//When textfield is pressed, click ok button.
$('#dashboard-role-add-modal .tf-name')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#dashboard-role-add-modal .tf-slug').focus();
        }
    });
$('#dashboard-role-add-modal .tf-slug')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('#dashboard-role-add-modal .btn-ok').click();
        }
    });

//When ok button is pressed in role-add modal...
$('#dashboard-role-add-modal .btn-ok')
    .click(function () {
        var name = $.trim($('#dashboard-role-add-modal .tf-name').val());
        var slug = $.trim($('#dashboard-role-add-modal .tf-slug').val());
        if (!name) {
            $('#dashboard-user-add-modal .tf-name').focus();
            return false;
        }
        if (!slug) {
            $('#dashboard-user-add-modal .tf-slug').focus();
            return false;
        }

        $.ajax({
            url: '/rest/role',
            type: 'post',
            data: {
                _token: $('meta[name="csrf-token"]').attr('content'),
                name: name,
                slug: slug
            },
            success: function (data) {
                window.util.notify('Role ' + name + ' has been created.');
                rolesDt.ajax.reload();
            },
            error: function (xhr) {

            }
        });
    });