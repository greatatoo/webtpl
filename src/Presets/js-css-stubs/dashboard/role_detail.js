/**
 * Render Role Detail - Fill up
 */
$('#role-detail')
    .on('render', function (e, data) {
        $('.role-name').html(data.name);
        $('input[name=name]').val(data.name);
        $('input[name=slug]').val(data.slug);
    });

/**
 * Button - Role Update
 */
$('.btn-role-info-update')
    .click(function () {
        var roleId = $(this).attr('data-role-id');
        var name = $.trim($('input[name=name]').val());

        var payload = {};
        if (name)
            payload['name'] = name;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update role info
        $.ajax({
            url: '/rest/role/' + roleId,
            type: 'put',
            data: payload,
            success: function (data) {
                console.log('role updated', data);
                $('#role-detail').trigger('render', data);
                window.util.notify('Role info has been updated.');
            }
        });
    });

/**
 * Button - Role User Add
 */
$('.btn-new-role-user')
    .click(function () {
        var roleId = $(this).attr('data-role-id');
        var account = $.trim($('input[name=tf-new-role-user]').val());
        if (!roleId || !account) {
            $('input[name=tf-new-role-user]').val('').focus();
            return false;
        }

        $.ajax({
            url: '/rest/role/' + roleId + '/account/' + account,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                $('#dashboard-role-users-table').trigger('reload');
                window.util.notify('Role user has been added.');
                $('input[name=tf-new-role-user]').val('').focus();
            },
            error: function (xhr) {
                if (xhr.status == 404)
                    window.util.notify(account + " doesn't exist.", 'error');
                $('input[name=tf-new-role-user]').val('').focus();
            }
        });
    });

$('input[name=tf-new-role-user]')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('.btn-new-role-user').click();
        }
    });

/**
 * Button - Role Permissions Update
 */
$('.btn-role-permissions-update')
    .click(function () {
        var roleId = $(this).attr('data-role-id');
        // var checkedArr = [];
        // //Collect checked roles
        // $('#dashboard-user-permissions-table input[type=checkbox]')
        //     .each(function (idx, el) {
        //         if ($(el).prop('checked'))
        //             checkedArr.push($(el).val());
        //     });

        // var payload = {};
        // payload['permissions'] = checkedArr;
        // payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        // //update user permissions
        // $.ajax({
        //     url: '/rest/user/' + userId + '/permission',
        //     type: 'put',
        //     data: payload,
        //     success: function () {
        //         console.log('user permissions updated');
        //         window.util.notify('User permissions has been updated.');
        //     }
        // });
    });

/**
 * Button - Role Delete
 */
var btnRoleDelete = $('.btn-role-delete');
var confirmTimes = btnRoleDelete.attr('data-confirm-times');
$('.confirm-times', btnRoleDelete).text(confirmTimes);

btnRoleDelete
    .click(function () {
        var confirmVal = parseInt($('.confirm-times', this).text(), 10);
        if (confirmVal > 1) {
            $('.confirm-times', this).text(confirmVal - 1);
            return false;
        } else if (confirmVal == 0) {
            return false;
        }

        var roleId = $(this).attr('data-role-id');

        $('.confirm-times', this).text(0);

        $.ajax({
            url: '/rest/role/' + roleId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                window.location.href = "/dashboard/roles";
            }
        });
    });

/**
 * DataTable - Role's Users
 */
var roleUsersDt = $('#dashboard-role-users-table').DataTable({
    "columnDefs": [
        {
            "targets": 0,
            "render": function (data, type, row, meta) {
                var userId = data[0];
                var isChecked = data[1];
                return '<input type="checkbox" value="' + userId + '" ' + (isChecked ? 'checked' : '') + '>';
            }
        },
        {
            "targets": 1,
            "render": function (data, type, row, meta) {
                var userName = data[0];
                var userAccount = data[1];
                return '<span title="' + userAccount + '">' + userName + '</span';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

$('#dashboard-role-users-table')
    //Remove user from role
    .on('removeUser', function (e, userId) {
        var roleId = $(this).attr('data-role-id');
        $.ajax({
            url: '/rest/role/' + roleId + '/user/' + userId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && roleId == 1))
                    window.util.notify('Role user has been removed.');
                $('#dashboard-role-users-table').trigger('reload');
            }
        });
    })
    //Reload role's users
    .on('reload', function () {
        var self = $(this);
        var roleId = $(this).attr('data-role-id');

        roleUsersDt.clear();

        //Get role detail
        $.ajax({
            url: '/rest/role/' + roleId,
            type: 'get',
            success: function (data) {
                $('#role-detail').trigger('render', data);
            },
            error: function (xhr) {
                window.util.notify('No such role.', 'error');
            }
        });

        $.ajax({
            url: '/rest/role/' + roleId + '/user',
            type: 'get',
            success: function (userArr) {
                var rowArr = [];
                userArr.forEach(function (el) {
                    rowArr.push([[el.user_id, true], [el.user_name, el.user_account]]);
                });
                roleUsersDt.rows.add(rowArr).draw();

                //checkbox clicked
                $('input[type=checkbox]', self)
                    .change(function () {
                        if (!$(this).is(":checked")) {
                            var userId = $(this).val();
                            self.trigger('removeUser', userId);
                        }
                    });
            },
            error: function (xhr) {
            }
        });
    });

/**
 * Load role's users
 */
$(function () {
    $('#dashboard-role-users-table').trigger('reload');
});

/**
* DataTable - Role's Permissions
*/
// var rolePermissionsDt = $('#dashboard-role-permissions-table').DataTable({
//     "columnDefs": [
//         {
//             "targets": 0,
//             "render": function (data, type, row, meta) {
//                 var permissionId = data[0];
//                 var isChecked = data[1];
//                 return '<input type="checkbox" value="' + permissionId + '" ' + (isChecked ? 'checked' : '') + '>';
//             }
//         },
//         {
//             "targets": 1,
//             "render": function (data, type, row, meta) {
//                 var permissionName = data[0];
//                 var permissionSlug = data[1];
//                 return '<span title="' + permissionSlug + '">' + permissionName + '</span';
//             }
//         }
//     ],
//     "paging": false,
//     "ordering": false,
//     "info": false,
//     "searching": false,
//     "stateSave": false
// });

/**
 * Load role's permissions
 */
$(function () {
    var roleId = $('#dashboard-role-permissions-table').attr('data-role-id');

    // new Promise(function (resolve, reject) {
    //     //Get all permissions
    //     $.ajax({
    //         url: '/rest/permission',
    //         type: 'get',
    //         success: function (allPermissions) {
    //             resolve(allPermissions);
    //         },
    //         error: function (xhr) {
    //             reject(xhr.status);
    //         }
    //     });
    // })
    //     .then((allPermissions) => {
    //         var checkedArr = [];
    //         //Get user's permissions
    //         $.ajax({
    //             url: '/rest/user/' + userId + '/permission',
    //             type: 'get',
    //             success: function (userPermissions) {
    //                 userPermissions.forEach(function (el) {
    //                     checkedArr.push(el.permission_id);
    //                 });

    //                 //Combine 2 arraies
    //                 var rowArr = [];
    //                 allPermissions.forEach(function (el) {
    //                     var isChecked = $.inArray(el.id, checkedArr) >= 0;
    //                     rowArr.push([[el.id, isChecked], [el.name, el.slug]]);
    //                 });
    //                 //Render datatable
    //                 userPermissionsDt.rows.add(rowArr).draw();
    //             },
    //             error: function (xhr) {
    //             }
    //         });
    //     });
});