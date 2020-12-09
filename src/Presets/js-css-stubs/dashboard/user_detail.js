/**
 * Button - User Detail Update
 */
$('.btn-user-detail-update')
    .click(function () {
        var userId = $(this).attr('data-user-id');
        console.log('btnUserDetailUpdate clicked ' + userId);
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
        console.log('btnUserDelete clicked ' + userId);
        $('.confirm-times', this).text(0);
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