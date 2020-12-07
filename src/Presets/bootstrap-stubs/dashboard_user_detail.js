/**
 * Button - User Detail Update
 */
$('.btn-user-detail-update')
    .click(function () {
        var userId = $(this).attr('data-user-id');
        console.log('btnUserDetailUpdate clicked ' + userId);
    });

/**
 * DataTable - User's Roles
 */
var userRolesDt = $('#dashboard-users-roles-table').DataTable({
    "columnDefs": [
        {
            "targets": 0,
            "render": function (data, type, row, meta) {
                var roleId = data[0];
                var isChecked = data[1];
                return '<input type="checkbox" value="' + roleId + '" ' + (isChecked ? 'checked' : '') + '>';
            }
        }
    ],
    "paging": false,
    "ordering": false,
    "info": false,
    "searching": false,
    "stateSave": false
});

// $(function () {
//     //Get all roles
//     $.ajax({
//         url: '/role',
//         type: 'get',
//         success: function (allRoles) {
//             //Get user roles
//             //TODO should use promise instead of inner ajax
//             var checkedArr = [];
//             $.ajax({
//                 url: '/user/' + userId + '/role',
//                 type: 'get',
//                 success: function (userRoles) {
//                     userRoles.forEach(function (el) {
//                         checkedArr.push(el.role_id);
//                     });

//                     //Combine 2 arraies
//                     var rowArr = [];
//                     allRoles.forEach(function (el) {
//                         var isChecked = $.inArray(el.id, checkedArr) >= 0;
//                         rowArr.push([[el.id, isChecked], el.name, el.slug]);
//                     });

//                     usersRolesDt.rows.add(rowArr).draw();
//                 },
//                 error: function (xhr) {
//                 }
//             });
//         },
//         error: function (xhr) {

//         }
//     });
// });



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


