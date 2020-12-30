/**
 * User Info
 */
$('#user-info')
    .on('reload', function () {
        //Get user detail
        var self = $(this);
        var userId = $(this).attr('data-user-id');
        $.ajax({
            url: '/rest/user/' + userId,
            type: 'get',
            success: function (data) {
                self.trigger('render', data);
            },
            error: function (xhr) {
                window.util.notify(trans('dashboard.popup.no_such_user'), 'error');
            }
        });
    })
    .on('render', function (e, data) {
        $('.user-name').html(data.name);
        $('input[name=account]').val(data.account);
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
                $('#user-info').trigger('render', data);
                window.util.notify(trans('dashboard.popup.user_info_updated'));
            }
        });
    });

$(function () {
    $('#user-info').trigger('reload');
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
                var roleId = data[0];
                var isChecked = data[1];
                var userId = data[2];
                var isReadOnly = (userId == 1 && roleId == 1);
                return '<input type="checkbox" value="' + roleId + '" ' + (isChecked ? 'checked' : '') + ' ' + (isReadOnly ? 'disabled' : '') + '>';
            }
        },
        {
            "targets": 1,
            "width": "24%",
            "render": function (data, type, row, meta) {
                var roleId = data[0];
                var roleName = data[1];
                var roleSlug = data[2];
                //get uri which is stored by blade view in attribute 'data-role-uri' in html
                var uri = $('#dashboard-user-roles-table').attr('data-role-uri');
                //generate correct url
                var url = '/' + util.strReplace(uri, { '{role}': roleId });
                return '<span title="' + roleSlug + '"><a href="' + url + '">' + roleName + '</a></span';
            }
        },
        {
            "targets": 2,
            "width": "75%",
            "render": function (data, type, row, meta) {
                return '<span>' + $.trim(data) + '</span';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

$('#dashboard-user-roles-table')
    //Add roles to user
    .on('addRole', function (e, roleId) {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        $.ajax({
            url: '/rest/user/' + userId + '/role/' + roleId,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && roleId == 1))
                    window.util.notify(trans('dashboard.popup.user_role_added'));
                self.trigger('reload');
            }
        });
    })
    //Remove roles from user
    .on('removeRole', function (e, roleId) {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        $.ajax({
            url: '/rest/user/' + userId + '/role/' + roleId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && roleId == 1))
                    window.util.notify(trans('dashboard.popup.user_role_removed'));
                self.trigger('reload');
            }
        });
    })
    .on('reload', function () {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        userRolesDt.clear();

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
                            rowArr.push([[el.id, isChecked, userId], [el.id, el.name, el.slug], el.desc]);
                        });
                        //Render datatable
                        userRolesDt.rows.add(rowArr).draw();

                        //Checkbox clicked
                        $('input[type=checkbox]', self)
                            .change(function () {
                                var roleId = $(this).val();
                                if ($(this).is(":checked")) {
                                    self.trigger('addRole', roleId);
                                } else {
                                    self.trigger('removeRole', roleId);
                                }
                            });
                    },
                    error: function (xhr) {
                    }
                });
            });
    });

$('#user-roles-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        userRolesDt.columns.adjust().draw();
    });

/**
 * Load user's roles
 */
$(function () {
    $('#dashboard-user-roles-table').trigger('reload');
});

/**
* DataTable - User's Permissions
*/
var userPermissionsDt = $('#dashboard-user-permissions-table').DataTable({
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
                var userId = data[2];
                var isReadOnly = (userId == 1 && permissionId == 1);
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
                var uri = $('#dashboard-user-permissions-table').attr('data-permission-uri');
                //generate correct url
                var url = '/' + util.strReplace(uri, { '{permission}': permissionId });
                return '<span title="' + permissionSlug + '"><a href="' + url + '">' + permissionName + '</a></span';
            }
        },
        {
            "targets": 2,
            "width": "75%",
            "render": function (data, type, row, meta) {
                return '<span>' + $.trim(data) + '</span';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

$('#dashboard-user-permissions-table')
    //Add permission to user
    .on('addPermission', function (e, permissionId) {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        $.ajax({
            url: '/rest/user/' + userId + '/permission/' + permissionId,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && permissionId == 1))
                    window.util.notify(trans('dashboard.popup.user_permission_added'));
                self.trigger('reload');
            }
        });
    })
    //Remove permission from user
    .on('removePermission', function (e, permissionId) {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        $.ajax({
            url: '/rest/user/' + userId + '/permission/' + permissionId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && permissionId == 1))
                    window.util.notify(trans('dashboard.popup.user_permission_removed'));
                self.trigger('reload');
            }
        });
    })
    .on('reload', function () {
        var self = $(this);
        var userId = $(this).attr('data-user-id');

        userPermissionsDt.clear();

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
                            rowArr.push([[el.id, isChecked, userId], [el.id, el.name, el.slug], el.desc]);
                        });
                        //Render datatable
                        userPermissionsDt.rows.add(rowArr).draw();

                        //Checkbox clicked
                        $('input[type=checkbox]', self)
                            .change(function () {
                                var permissionId = $(this).val();
                                if ($(this).is(":checked")) {
                                    self.trigger('addPermission', permissionId);
                                } else {
                                    self.trigger('removePermission', permissionId);
                                }
                            });
                    },
                    error: function (xhr) {
                    }
                });
            });
    });

$('#user-permissions-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        userPermissionsDt.columns.adjust().draw();
    });

/**
 * Load user's permissions
 */
$(function () {
    $('#dashboard-user-permissions-table').trigger('reload');
});