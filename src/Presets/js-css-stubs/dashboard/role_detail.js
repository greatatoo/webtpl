/**
 * Render Role Detail - Fill up
 */
$('#role-detail')
    .on('render', function (e, data) {
        $('.role-name').html(data.name);
        $('input[name=name]').val(data.name);
        $('input[name=slug]').val(data.slug);
        $('input[name=desc]').val(data.desc);
    });

/**
 * Button - Role Update
 */
$('.btn-role-info-update')
    .click(function () {
        var roleId = $(this).attr('data-role-id');
        var name = $.trim($('input[name=name]').val());
        var desc = $.trim($('input[name=desc]').val());

        var payload = {};
        if (name)
            payload['name'] = name;
        payload['desc'] = desc;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update role info
        $.ajax({
            url: '/rest/role/' + roleId,
            type: 'put',
            data: payload,
            success: function (data) {
                $('#role-detail').trigger('render', data);
                window.util.notify(trans('dashboard.popup.role_info_updated'));
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
                window.util.notify(trans('dashboard.popup.role_user_added'));
                $('input[name=tf-new-role-user]').val('').focus();
            },
            error: function (xhr) {
                if (xhr.status == 404)
                    window.util.notify(trans('dashboard.popup.doesnt_exist', { name: account }), 'error');
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
    "columnDefs": [
        {
            "targets": 0,
            "width": "1px",
            "render": function (data, type, row, meta) {
                var userId = data[0];
                var isChecked = data[1];
                var roleId = data[2];
                var isReadOnly = (userId == 1 && roleId == 1);
                return '<input type="checkbox" value="' + userId + '" ' + (isChecked ? 'checked' : '') + ' ' + (isReadOnly ? 'disabled' : '') + '>';
            }
        },
        {
            "targets": 1,
            "width": "24%",
            "render": function (data, type, row, meta) {
                var userId = data[0];
                var account = data[1];
                //get uri which is stored by blade view in attribute 'data-user-uri' in html
                var uri = $('#dashboard-role-users-table').attr('data-user-uri');
                //generate correct url
                var url = '/' + util.strReplace(uri, { '{user}': userId });
                return '<span><a href="' + url + '">' + account + '</a></span';
            }
        },
        {
            "targets": 2,
            "width": "75%",
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

$('#role-users-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        roleUsersDt.columns.adjust().draw();
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
                    window.util.notify(trans('dashboard.popup.role_user_removed'));
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
                window.util.notify(trans('dashboard.popup.no_such_role'), 'error');
            }
        });

        //Get role users
        $.ajax({
            url: '/rest/role/' + roleId + '/user',
            type: 'get',
            success: function (userArr) {
                var rowArr = [];
                userArr.forEach(function (el) {
                    rowArr.push([[el.user_id, true, roleId], [el.user_id, el.user_account], [el.user_name, el.user_account]]);
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
var rolePermissionsDt = $('#dashboard-role-permissions-table').DataTable({
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
    "columnDefs": [
        {
            "targets": 0,
            "width": "1px",
            "render": function (data, type, row, meta) {
                var permissionId = data[0];
                var isChecked = data[1];
                var roleId = data[2];
                var isReadOnly = (roleId == 1 && permissionId == 1);
                return '<input type="checkbox" value="' + permissionId + '" ' + (isChecked ? 'checked' : '') + ' ' + (isReadOnly ? 'disabled' : '') + '>';
            }
        },
        {
            "targets": 1,
            "width": "24%",
            "render": function (data, type, row, meta) {
                var permissionId = data[0];
                var permissionName = data[1];
                var permissionSlug = data[2];
                //get uri which is stored by blade view in attribute 'data-permission-uri' in html
                var uri = $('#dashboard-role-permissions-table').attr('data-permission-uri');
                //generate correct url
                var url = '/' + util.strReplace(uri, { '{permission}': permissionId });
                return '<span title="' + permissionSlug + '"><a href="' + url + '">' + permissionName + '</a></span>';
            }
        },
        {
            "targets": 2,
            "width": "75%",
            "render": function (data, type, row, meta) {
                return '<span>' + $.trim(data) + '</span>';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

$('#role-permissions-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        rolePermissionsDt.columns.adjust().draw();
    });

$('#dashboard-role-permissions-table')
    //Add permission to role
    .on('addPermission', function (e, permId) {
        var roleId = $(this).attr('data-role-id');
        $.ajax({
            url: '/rest/role/' + roleId + '/permission/' + permId,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(permId == 1 && roleId == 1))
                    window.util.notify(trans('dashboard.popup.role_permission_added'));
                $('#dashboard-role-permissions-table').trigger('reload');
            }
        });
    })
    //Remove permission from role
    .on('removePermission', function (e, permId) {
        var roleId = $(this).attr('data-role-id');
        $.ajax({
            url: '/rest/role/' + roleId + '/permission/' + permId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(permId == 1 && roleId == 1))
                    window.util.notify(trans('dashboard.popup.role_permission_removed'));
                $('#dashboard-role-permissions-table').trigger('reload');
            }
        });
    })
    .on('reload', function () {
        var self = $(this);
        var roleId = $('#dashboard-role-permissions-table').attr('data-role-id');

        rolePermissionsDt.clear();

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
                //Get role's permissions
                $.ajax({
                    url: '/rest/role/' + roleId + '/permission',
                    type: 'get',
                    success: function (rolePermissions) {
                        rolePermissions.forEach(function (el) {
                            checkedArr.push(el.permission_id);
                        });

                        //Combine 2 arraies
                        var rowArr = [];
                        allPermissions.forEach(function (el) {
                            var isChecked = $.inArray(el.id, checkedArr) >= 0;
                            rowArr.push([[el.id, isChecked, roleId], [el.id, el.name, el.slug], el.desc]);
                        });
                        //Render datatable
                        rolePermissionsDt.rows.add(rowArr).draw();

                        //Checkbox clicked
                        $('input[type=checkbox]', self)
                            .change(function () {
                                var permId = $(this).val();
                                if ($(this).is(":checked")) {
                                    $('#dashboard-role-permissions-table').trigger('addPermission', permId);
                                } else {
                                    $('#dashboard-role-permissions-table').trigger('removePermission', permId);
                                }
                            });
                    },
                    error: function (xhr) {
                    }
                });
            });
    });

/**
 * Load role's permissions
 */
$(function () {
    $('#dashboard-role-permissions-table').trigger('reload');
});