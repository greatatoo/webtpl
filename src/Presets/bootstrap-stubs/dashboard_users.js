var render = {
    dtRowUserDetail: function (data) {
        console.log(data);
        var html = '<div class="container p-3">';//container

        //row: name
        html += '<div class="row mt-1">';
        html += '<label for="name" class="col-md-3 col-form-label col-form-label-sm text-md-right">Name</label>';
        html += '<div class="col-md-6">';
        html += '<input type="text" class="form-control form-control-sm name="name" value="' + data.name + '" required autofocus>';
        html += '</div>';
        html += '</div>';
        //row: email
        html += '<div class="row mt-1">';
        html += '<label for="email" class="col-md-3 col-form-label col-form-label-sm text-md-right">Email</label>';
        html += '<div class="col-md-6">';
        html += '<input type="text" class="form-control form-control-sm name="email" value="' + data.email + '" required>';
        html += '</div>';
        html += '</div>';
        //row: password
        html += '<div class="row mt-1">';
        html += '<label for="password" class="col-md-3 col-form-label col-form-label-sm text-md-right">Password</label>';
        html += '<div class="col-md-6">';
        html += '<input type="password" class="form-control form-control-sm name="password" value="">';
        html += '</div>';
        html += '</div>';
        //row: api token
        html += '<div class="row mt-1">';
        html += '<label for="api-token" class="col-md-3 col-form-label col-form-label-sm text-md-right">API Token</label>';
        html += '<div class="col-md-6">';
        html += '<input type="text" class="form-control form-control-sm name="api-token" value="' + data.api_token + '">';
        html += '</div>';
        html += '</div>';
        //row: active
        html += '<div class="row mt-1">';
        html += '<label for="active" class="col-md-3 col-form-label col-form-label-sm text-md-right">Active</label>';
        html += '<div class="col-md-6">';
        html += '<input type="text" class="form-control form-control-sm name="active" value="' + data.active + '">';
        html += '</div>';
        html += '</div>';
        //row: buttons
        html += '<div class="row mt-3 justify-content-md-center">';
        html += '<button class="btn btn-danger btn-sm btn-users-delete" data-id="' + data.id + '" data-confirm-times="3">Delete (<span class="confirm-times"></span>)</button>';
        html += '<button class="btn btn-primary btn-sm ml-1 btn-users-roles" data-id="' + data.id + '">Roles</button>';
        html += '<button class="btn btn-primary btn-sm ml-1 btn-users-permissions" data-id="' + data.id + '">Permissions</button>';
        html += '<button class="btn btn-primary btn-sm ml-1 btn-users-update" data-id="' + data.id + '">Update</button>';
        html += '</div>';

        html += '</div>';//end container
        return html;
    }
};

var bindUsersButtons = function () {
    var btnUsersDelete = $('.btn-users-delete', '#dashboard-users');
    if (!btnUsersDelete.hasClass('users-btn-binded')) {
        var confirmTimes = btnUsersDelete.attr('data-confirm-times');
        $('.confirm-times', btnUsersDelete).text(confirmTimes);

        btnUsersDelete
            .addClass('users-btn-binded')
            .click(function () {
                var confirmVal = parseInt($('.confirm-times', this).text(), 10);
                if (confirmVal > 1) {
                    $('.confirm-times', this).text(confirmVal - 1);
                    return false;
                }else if(confirmVal == 0){
                    return false;
                }
                
                var userId = $(this).attr('data-id');
                console.log('btnUsersDelete clicked ' + userId);
                $('.confirm-times', this).text(0);
            });
    }

    var btnUsersRoles = $('.btn-users-roles', '#dashboard-users');
    if (!btnUsersRoles.hasClass('users-btn-binded')) {
        btnUsersRoles
            .addClass('users-btn-binded')
            .click(function () {
                var userId = $(this).attr('data-id');
                console.log('btnUsersRoles clicked ' + userId);
            });
    }

    var btnUsersPermissions = $('.btn-users-permissions', '#dashboard-users');
    if (!btnUsersPermissions.hasClass('users-btn-binded')) {
        btnUsersPermissions
            .addClass('users-btn-binded')
            .click(function () {
                var userId = $(this).attr('data-id');
                console.log('btnUsersPermissions clicked ' + userId);
            });
    }

    var btnUsersUpdate = $('.btn-users-update', '#dashboard-users');
    if (!btnUsersUpdate.hasClass('users-btn-binded')) {
        btnUsersUpdate
            .addClass('users-btn-binded')
            .click(function () {
                var userId = $(this).attr('data-id');
                console.log('btnUsersUpdate clicked ' + userId);
            });
    }
}

//https://datatables.net/examples/server_side/row_details.html
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
                { "db": "api_token", "dt": "api_token" },
                { "db": "active", "dt": "active" },
            ]
        }
    },
    "columns": [
        { "data": "account" },
        { "data": "name" },
        { "data": "email" },
        { "data": "created_at" },
        {
            "data": null,
            "class": "details-control",
            "orderable": false,
            "defaultContent": "+",
        },
        { "data": "api_token" },
        { "data": "active" },
    ],
    "columnDefs": [
        {
            "targets": [5, 6],//hide column 'api_token' and 'active'
            "visible": false,
            "searchable": false
        }
    ],
    "paging": true,
    "ordering": true,
    "info": true,
    "searching": true,
    "stateSave": true
});

// Array to track the ids of the details displayed rows
var detailRows = [];

$('#dashboard-users tbody').on('click', 'tr td.details-control', function () {
    var tr = $(this).closest('tr');
    var row = usersDt.row(tr);
    var idx = $.inArray(tr.attr('id'), detailRows);

    if (row.child.isShown()) {
        tr.removeClass('details');
        row.child.hide();

        // Remove from the 'open' array
        detailRows.splice(idx, 1);
    }
    else {
        tr.addClass('details');
        row.child(render.dtRowUserDetail(row.data())).show();

        // Add to the 'open' array
        if (idx === -1) {
            detailRows.push(tr.attr('id'));
        }

        bindUsersButtons();
    }
});

// On each draw, loop over the `detailRows` array and show any child rows
usersDt.on('draw', function () {
    $.each(detailRows, function (i, id) {
        $('#' + id + ' td.details-control').trigger('click');
    });
});