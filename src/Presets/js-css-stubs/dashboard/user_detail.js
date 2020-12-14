/**
 * Render User Detail - Fill up
 */
$('#user-detail')
    .on('render', function (e, data) {
        $('.user-name').html(data.name);
        $('input[name=name]').val(data.name);
        $('input[name=email]').val(data.email);
        $('input[name=password]').val('');
        $('input[name=api-token]').val(data.api_token);
        $('input[name=active]').prop("checked", (data.active ? true : false));
    });

/**
 * Button - User Update
 */
$('.btn-user-info-update')
    .click(function () {
        var userId = $(this).attr('data-user-id');
        var name = $.trim($('input[name=name]').val());
        var email = $.trim($('input[name=email]').val());
        var passwd = $.trim($('input[name=password]').val());
        var apiToken = $.trim($('input[name=api-token]').val());
        var isActive = $('input[name=active]').prop("checked");

        var payload = {};
        if (name)
            payload['name'] = name;
        if (passwd)
            payload['password'] = passwd;
        if (apiToken)
            payload['api_token'] = apiToken;
        payload['email'] = email;
        payload['active'] = isActive ? 1 : 0;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update user info
        $.ajax({
            url: '/rest/user/' + userId,
            type: 'put',
            data: payload,
            success: function (data) {
                console.log('user updated', data);
                $('#user-detail').trigger('render', data);
                window.util.notify('User info has been updated.');
            }
        });
    });

/**
 * Button - User Roles Update
 */
$('.btn-user-roles-update')
    .click(function () {
        var userId = $(this).attr('data-user-id');
        var checkedArr = [];
        //Collect checked roles
        $('#dashboard-user-roles-table input[type=checkbox]')
            .each(function (idx, el) {
                if ($(el).prop('checked'))
                    checkedArr.push($(el).val());
            });

        var payload = {};
        payload['roles'] = checkedArr;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update user roles
        $.ajax({
            url: '/rest/user/' + userId + '/role',
            type: 'put',
            data: payload,
            success: function () {
                console.log('user roles updated');
                window.util.notify('User roles has been updated.');
            }
        });
    });

/**
 * Button - User Permissions Update
 */
$('.btn-user-permissions-update')
    .click(function () {
        var userId = $(this).attr('data-user-id');
        var checkedArr = [];
        //Collect checked roles
        $('#dashboard-user-permissions-table input[type=checkbox]')
            .each(function (idx, el) {
                if ($(el).prop('checked'))
                    checkedArr.push($(el).val());
            });

        var payload = {};
        payload['permissions'] = checkedArr;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update user permissions
        $.ajax({
            url: '/rest/user/' + userId + '/permission',
            type: 'put',
            data: payload,
            success: function () {
                console.log('user permissions updated');
                window.util.notify('User permissions has been updated.');
            }
        });
    });

/**
 * Button - User Delete
 */
var btnUserDelete = $('.btn-user-delete');
var confirmTimes = btnUserDelete.attr('data-confirm-times');
$('.confirm-times', btnUserDelete).text(confirmTimes);

btnUserDelete
    .click(function () {
        var confirmVal = parseInt($('.confirm-times', this).text(), 10);
        if (confirmVal > 1) {
            $('.confirm-times', this).text(confirmVal - 1);
            return false;
        } else if (confirmVal == 0) {
            return false;
        }

        var userId = $(this).attr('data-user-id');
        
        $('.confirm-times', this).text(0);

        $.ajax({
            url: '/rest/user/' + userId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                window.location.href = "/dashboard/users";
            }
        });
    });

/**
 * DataTable - User's Roles
 */
var userRolesDt = $('#dashboard-user-roles-table').DataTable({
    "columnDefs": [
        {
            "targets": 0,
            "render": function (data, type, row, meta) {
                var roleId = data[0];
                var isChecked = data[1];
                return '<input type="checkbox" value="' + roleId + '" ' + (isChecked ? 'checked' : '') + '>';
            }
        },
        {
            "targets": 1,
            "render": function (data, type, row, meta) {
                var roleName = data[0];
                var roleSlug = data[1];
                return '<span title="' + roleSlug + '">' + roleName + '</span';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

/**
 * Load user's roles
 */
$(function () {
    var userId = $('#dashboard-user-roles-table').attr('data-user-id');

    //Get user detail
    $.ajax({
        url: '/rest/user/' + userId,
        type: 'get',
        success: function (data) {
            console.log(data);
            $('#user-detail').trigger('render', data);
        },
        error: function (xhr) {
            window.util.notify('No such user.', 'error');
        }
    });

    new Promise(function (resolve, reject) {
        //Get all roles
        $.ajax({
            url: '/rest/role',
            type: 'get',
            success: function (allRoles) {
                resolve(allRoles);
            },
            error: function (xhr) {
                reject(xhr.status);
            }
        });
    })
        .then((allRoles) => {
            var checkedArr = [];
            //Get user's roles
            $.ajax({
                url: '/rest/user/' + userId + '/role',
                type: 'get',
                success: function (userRoles) {
                    userRoles.forEach(function (el) {
                        checkedArr.push(el.role_id);
                    });

                    //Combine 2 arraies
                    var rowArr = [];
                    allRoles.forEach(function (el) {
                        var isChecked = $.inArray(el.id, checkedArr) >= 0;
                        rowArr.push([[el.id, isChecked], [el.name, el.slug]]);
                    });
                    //Render datatable
                    userRolesDt.rows.add(rowArr).draw();
                },
                error: function (xhr) {
                }
            });
        });
});

/**
* DataTable - User's Permissions
*/
var userPermissionsDt = $('#dashboard-user-permissions-table').DataTable({
    "columnDefs": [
        {
            "targets": 0,
            "render": function (data, type, row, meta) {
                var permissionId = data[0];
                var isChecked = data[1];
                return '<input type="checkbox" value="' + permissionId + '" ' + (isChecked ? 'checked' : '') + '>';
            }
        },
        {
            "targets": 1,
            "render": function (data, type, row, meta) {
                var permissionName = data[0];
                var permissionSlug = data[1];
                return '<span title="' + permissionSlug + '">' + permissionName + '</span';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

/**
 * Load user's permissions
 */
$(function () {
    var userId = $('#dashboard-user-permissions-table').attr('data-user-id');

    new Promise(function (resolve, reject) {
        //Get all permissions
        $.ajax({
            url: '/rest/permission',
            type: 'get',
            success: function (allPermissions) {
                resolve(allPermissions);
            },
            error: function (xhr) {
                reject(xhr.status);
            }
        });
    })
        .then((allPermissions) => {
            var checkedArr = [];
            //Get user's permissions
            $.ajax({
                url: '/rest/user/' + userId + '/permission',
                type: 'get',
                success: function (userPermissions) {
                    userPermissions.forEach(function (el) {
                        checkedArr.push(el.permission_id);
                    });

                    //Combine 2 arraies
                    var rowArr = [];
                    allPermissions.forEach(function (el) {
                        var isChecked = $.inArray(el.id, checkedArr) >= 0;
                        rowArr.push([[el.id, isChecked], [el.name, el.slug]]);
                    });
                    //Render datatable
                    userPermissionsDt.rows.add(rowArr).draw();
                },
                error: function (xhr) {
                }
            });
        });
});