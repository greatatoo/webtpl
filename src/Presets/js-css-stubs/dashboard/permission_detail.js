/**
 * Render Permission Detail - Fill up
 */
$('#permission-detail')
    .on('render', function (e, data) {
        $('.permission-name').html(data.name);
        $('input[name=name]').val(data.name);
        $('input[name=slug]').val(data.slug);
        $('input[name=desc]').val(data.desc);
    });

/**
 * Button - Permission Update
 */
$('.btn-permission-info-update')
    .click(function () {
        var permissionId = $(this).attr('data-permission-id');
        var name = $.trim($('input[name=name]').val());
        var desc = $.trim($('input[name=desc]').val());

        var payload = {};
        if (name)
            payload['name'] = name;
        payload['desc'] = desc;
        payload['_token'] = $('meta[name="csrf-token"]').attr('content');

        //update permission info
        $.ajax({
            url: '/rest/permission/' + permissionId,
            type: 'put',
            data: payload,
            success: function (data) {
                $('#permission-detail').trigger('render', data);
                window.util.notify(trans('dashboard.popup.permission_info_updated'));
            }
        });
    });

/**
 * Button - Permission User Add
 */
$('.btn-new-permission-user')
    .click(function () {
        var permissionId = $(this).attr('data-permission-id');
        var account = $.trim($('input[name=tf-new-permission-user]').val());
        if (!permissionId || !account) {
            $('input[name=tf-new-permission-user]').val('').focus();
            return false;
        }

        $.ajax({
            url: '/rest/permission/' + permissionId + '/account/' + account,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                $('#dashboard-permission-users-table').trigger('reload');
                window.util.notify(trans('dashboard.popup.permission_user_added'));
                $('input[name=tf-new-permission-user]').val('').focus();
            },
            error: function (xhr) {
                if (xhr.status == 404)
                    window.util.notify(trans('dashboard.popup.doesnt_exist', { name: account }), 'error');
                $('input[name=tf-new-permission-user]').val('').focus();
            }
        });
    });

$('input[name=tf-new-permission-user]')
    .on("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('.btn-new-permission-user').click();
        }
    });

/**
 * Button - Permission Delete
 */
var btnPermissionDelete = $('.btn-permission-delete');
var confirmTimes = btnPermissionDelete.attr('data-confirm-times');
$('.confirm-times', btnPermissionDelete).text(confirmTimes);

btnPermissionDelete
    .click(function () {
        var confirmVal = parseInt($('.confirm-times', this).text(), 10);
        if (confirmVal > 1) {
            $('.confirm-times', this).text(confirmVal - 1);
            return false;
        } else if (confirmVal == 0) {
            return false;
        }

        var permissionId = $(this).attr('data-permission-id');

        $('.confirm-times', this).text(0);

        $.ajax({
            url: '/rest/permission/' + permissionId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                //get uri which is stored by blade view in attribute 'data-permissions-uri' in html
                var uri = btnPermissionDelete.attr('data-permissions-uri');
                //generate correct url
                var url = '/' + uri;
                window.location.href = url;
            }
        });
    });

/**
 * DataTable - Permission's Users
 */
var permissionUsersDt = $('#dashboard-permission-users-table').DataTable({
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
                var permissionId = data[2];
                var isReadOnly = (userId == 1 && permissionId == 1);
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
                var uri = $('#dashboard-permission-users-table').attr('data-user-uri');
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

$('#permission-users-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        permissionUsersDt.columns.adjust().draw();
    });

$('#dashboard-permission-users-table')
    //Remove user from permission
    .on('removeUser', function (e, userId) {
        var permissionId = $(this).attr('data-permission-id');
        $.ajax({
            url: '/rest/permission/' + permissionId + '/user/' + userId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(userId == 1 && permissionId == 1))
                    window.util.notify(trans('dashboard.popup.permission_user_removed'));
                $('#dashboard-permission-users-table').trigger('reload');
            }
        });
    })
    //Reload permission's users
    .on('reload', function () {
        var self = $(this);
        var permissionId = $(this).attr('data-permission-id');

        permissionUsersDt.clear();

        //Get permission detail
        $.ajax({
            url: '/rest/permission/' + permissionId,
            type: 'get',
            success: function (data) {
                $('#permission-detail').trigger('render', data);
            },
            error: function (xhr) {
                window.util.notify(trans('dashboard.popup.no_such_permission'), 'error');
            }
        });

        //Get permission users
        $.ajax({
            url: '/rest/permission/' + permissionId + '/user',
            type: 'get',
            success: function (userArr) {
                var rowArr = [];
                userArr.forEach(function (el) {
                    rowArr.push([[el.user_id, true, permissionId], [el.user_id, el.user_account], [el.user_name, el.user_account]]);
                });
                permissionUsersDt.rows.add(rowArr).draw();

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
 * Load permission's users
 */
$(function () {
    $('#dashboard-permission-users-table').trigger('reload');
});

/**
* DataTable - Permission's roles
*/
var permissionRolesDt = $('#dashboard-permission-roles-table').DataTable({
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
                var permissionId = data[2];
                var isReadOnly = (roleId == 1 && permissionId == 1);
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
                var uri = $('#dashboard-permission-roles-table').attr('data-role-uri');
                //generate correct url
                var url = '/' + util.strReplace(uri, { '{role}': roleId });
                return '<span title="' + roleSlug + '"><a href="' + url + '">' + roleName + '</a></span>';
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

$('#permission-roles-tab')
    .on('shown.bs.tab', function (e) {
        //repaint datatable
        permissionRolesDt.columns.adjust().draw();
    });

$('#dashboard-permission-roles-table')
    //Add role to permission
    .on('addRole', function (e, roleId) {
        var permissionId = $(this).attr('data-permission-id');
        $.ajax({
            url: '/rest/permission/' + permissionId + '/role/' + roleId,
            type: 'post',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(roleId == 1 && permissionId == 1))
                    window.util.notify(trans('dashboard.popup.permission_role_added'));
                $('#dashboard-permission-roles-table').trigger('reload');
            }
        });
    })
    //Remove role from permission
    .on('removeRole', function (e, roleId) {
        var permissionId = $(this).attr('data-permission-id');
        $.ajax({
            url: '/rest/permission/' + permissionId + '/role/' + roleId,
            type: 'delete',
            data: {
                '_token': $('meta[name="csrf-token"]').attr('content')
            },
            success: function () {
                if (!(roleId == 1 && permissionId == 1))
                    window.util.notify(trans('dashboard.popup.permission_role_removed'));
                $('#dashboard-permission-roles-table').trigger('reload');
            }
        });
    })
    .on('reload', function () {
        var self = $(this);
        var permissionId = $('#dashboard-permission-roles-table').attr('data-permission-id');

        permissionRolesDt.clear();

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
                //Get permission's roles
                $.ajax({
                    url: '/rest/permission/' + permissionId + '/role',
                    type: 'get',
                    success: function (permissionRoles) {
                        permissionRoles.forEach(function (el) {
                            checkedArr.push(el.role_id);
                        });

                        //Combine 2 arraies
                        var rowArr = [];
                        allRoles.forEach(function (el) {
                            var isChecked = $.inArray(el.id, checkedArr) >= 0;
                            rowArr.push([[el.id, isChecked, permissionId], [el.id, el.name, el.slug], el.desc]);
                        });
                        //Render datatable
                        permissionRolesDt.rows.add(rowArr).draw();

                        //Checkbox clicked
                        $('input[type=checkbox]', self)
                            .change(function () {
                                var roleId = $(this).val();
                                if ($(this).is(":checked")) {
                                    $('#dashboard-permission-roles-table').trigger('addRole', roleId);
                                } else {
                                    $('#dashboard-permission-roles-table').trigger('removeRole', roleId);
                                }
                            });
                    },
                    error: function (xhr) {
                    }
                });
            });
    });

/**
 * Load permission's roles
 */
$(function () {
    $('#dashboard-permission-roles-table').trigger('reload');
});