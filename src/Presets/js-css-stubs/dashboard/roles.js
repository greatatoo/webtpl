//https://datatables.net/examples/server_side/row_details.html
//Tips: In server mode data table, you should set the same number of columns in 'ajax.data', 'option.columns' and thead.th .
var rolesDt = $('#dashboard-roles').DataTable({
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
            "table": "roles",
            "primary_key": "id",
            "columns": [
                { "db": "id", "dt": "id" },
                { "db": "name", "dt": "name" },
                { "db": "slug", "dt": "slug" },
                { "db": "desc", "dt": "desc" },
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
        { "data": "slug" },
        { "data": "name" },
        { "data": "desc" },
    ],
    "paging": true,
    "ordering": true,
    "info": true,
    "searching": true,
    "stateSave": true,
    "scrollX": true
});

//Make clickable for each row of table dashboard roles.
$('#dashboard-roles tbody')
    .on('click', 'tr', function () {
        var tr = $(this);
        var row = rolesDt.row(tr);
        var roleId = row.data().id;

        //get uri which is stored by blade view in attribute 'data-role-uri' in html
        var uri = $('#dashboard-roles').attr('data-role-uri');
        //generate correct url
        var url = '/' + util.strReplace(uri, { '{role}': roleId });
        window.location.href = url;
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
                window.util.notify(trans('dashboard.popup.role_created', { name: name }));
                rolesDt.ajax.reload();
            },
            error: function (xhr) {

            }
        });
    });