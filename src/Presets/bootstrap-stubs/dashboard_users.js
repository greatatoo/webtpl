// var render = {
//     dtRowUserDetail: function (data) {
//         var html = '<div class="container p-3">';//container

//         //row: name
//         html += '<div class="row mt-1">';
//         html += '<label for="name" class="col-md-3 col-form-label col-form-label-sm text-md-right">Name</label>';
//         html += '<div class="col-md-6">';
//         html += '<input type="text" class="form-control form-control-sm name="name" value="' + data.name + '" required autofocus>';
//         html += '</div>';
//         html += '</div>';
//         //row: email
//         html += '<div class="row mt-1">';
//         html += '<label for="email" class="col-md-3 col-form-label col-form-label-sm text-md-right">Email</label>';
//         html += '<div class="col-md-6">';
//         html += '<input type="text" class="form-control form-control-sm name="email" value="' + data.email + '" required>';
//         html += '</div>';
//         html += '</div>';
//         //row: password
//         html += '<div class="row mt-1">';
//         html += '<label for="password" class="col-md-3 col-form-label col-form-label-sm text-md-right">Password</label>';
//         html += '<div class="col-md-6">';
//         html += '<input type="password" class="form-control form-control-sm name="password" value="">';
//         html += '</div>';
//         html += '</div>';
//         //row: api token
//         html += '<div class="row mt-1">';
//         html += '<label for="api-token" class="col-md-3 col-form-label col-form-label-sm text-md-right">API Token</label>';
//         html += '<div class="col-md-6">';
//         html += '<input type="text" class="form-control form-control-sm name="api-token" value="' + data.api_token + '">';
//         html += '</div>';
//         html += '</div>';
//         //row: active
//         html += '<div class="row mt-1">';
//         html += '<label for="active" class="col-md-3 col-form-label col-form-label-sm text-md-right">Active</label>';
//         html += '<div class="col-md-6">';
//         html += '<input type="text" class="form-control form-control-sm name="active" value="' + data.active + '">';
//         html += '</div>';
//         html += '</div>';
//         //row: buttons
//         html += '<div class="row mt-3 justify-content-md-center">';
//         html += '<button class="btn btn-danger btn-sm btn-users-delete" data-user-id="' + data.id + '" data-user-name="' + data.name + '" data-confirm-times="3">Delete (<span class="confirm-times"></span>)</button>';
//         html += '<button class="btn btn-primary btn-sm ml-1 btn-users-roles" data-toggle="modal" data-target="#dashboard-users-roles-modal" data-user-id="' + data.id + '" data-user-name="' + data.name + '">Roles</button>';
//         html += '<button class="btn btn-primary btn-sm ml-1 btn-users-permissions" data-toggle="modal" data-target="#dashboard-users-permissions-modal" data-user-id="' + data.id + '" data-user-name="' + data.name + '">Permissions</button>';
//         html += '<button class="btn btn-primary btn-sm ml-1 btn-users-update" data-user-id="' + data.id + '" data-user-name="' + data.name + '">Update</button>';
//         html += '</div>';

//         html += '</div>';//end container
//         return html;
//     }
// };

// var bindUsersButtons = function () {
//     var btnUsersDelete = $('.btn-users-delete', '#dashboard-users');
//     if (!btnUsersDelete.hasClass('users-btn-binded')) {
//         var confirmTimes = btnUsersDelete.attr('data-confirm-times');
//         $('.confirm-times', btnUsersDelete).text(confirmTimes);

//         btnUsersDelete
//             .addClass('users-btn-binded')
//             .click(function () {
//                 var confirmVal = parseInt($('.confirm-times', this).text(), 10);
//                 if (confirmVal > 1) {
//                     $('.confirm-times', this).text(confirmVal - 1);
//                     return false;
//                 } else if (confirmVal == 0) {
//                     return false;
//                 }

//                 var userId = $(this).attr('data-user-id');
//                 var userName = $(this).attr('data-user-name');
//                 console.log('btnUsersDelete clicked ' + userId + ' ' + userName);
//                 $('.confirm-times', this).text(0);
//             });
//     }

//     var btnUsersUpdate = $('.btn-users-update', '#dashboard-users');
//     if (!btnUsersUpdate.hasClass('users-btn-binded')) {
//         btnUsersUpdate
//             .addClass('users-btn-binded')
//             .click(function () {
//                 var userId = $(this).attr('data-user-id');
//                 var userName = $(this).attr('data-user-name');
//                 console.log('btnUsersUpdate clicked ' + userId + ' ' + userName);
//             });
//     }
// }

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
                { "db": "active", "dt": "active" },
            ]
        }
    },
    "columns": [
        {
            "data": "id",
            "orderable": false,
            "render": function (data) {
                return '';//TODO user icon
            }
        },
        { "data": "account" },
        { "data": "name" },
        { "data": "email" },
        {
            "data": "active",
            "render": function (data, type) {
                return data;
            }
        },
        { "data": "created_at" },
    ],
    "paging": true,
    "ordering": true,
    "info": true,
    "searching": true,
    "stateSave": true,
    "scrollX": true
});

$('#dashboard-users tbody').on('click', 'tr', function () {
    var tr = $(this);
    var row = usersDt.row(tr);
    var userId = row.data().id;
    window.location.href = "/dashboard/users/"+userId;
});

// Array to track the ids of the details displayed rows
// var detailRows = [];

// $('#dashboard-users tbody').on('click', 'tr td.details-control', function () {
//     var tr = $(this).closest('tr');
//     var row = usersDt.row(tr);
//     var idx = $.inArray(tr.attr('id'), detailRows);

//     if (row.child.isShown()) {
//         tr.removeClass('details');
//         row.child.hide();

//         // Remove from the 'open' array
//         detailRows.splice(idx, 1);
//     }
//     else {
//         tr.addClass('details');
//         row.child(render.dtRowUserDetail(row.data())).show();

//         // Add to the 'open' array
//         if (idx === -1) {
//             detailRows.push(tr.attr('id'));
//         }

//         bindUsersButtons();
//     }
// });

// On each draw, loop over the `detailRows` array and show any child rows
// usersDt.on('draw', function () {
//     $.each(detailRows, function (i, id) {
//         $('#' + id + ' td.details-control').trigger('click');
//     });
// });

/**
 * User-Role Table
 */
// var usersRolesDt = $('#dashboard-users-roles-table').DataTable({
//     "columnDefs": [
//         {
//             "targets": 0,
//             "render": function (data, type, row, meta) {
//                 var roleId = data[0];
//                 var isChecked = data[1];
//                 return '<input type="checkbox" value="' + roleId + '" ' + (isChecked ? 'checked' : '') + '>';
//             }
//         }
//     ],
//     "paging": false,
//     "ordering": false,
//     "info": false,
//     "searching": false,
//     "stateSave": false
// });

// $('#dashboard-users-roles-modal')
//     .on('show.bs.modal', function (event) {
//         var button = $(event.relatedTarget); // Button that triggered the modal
//         var userId = button.data('user-id'); // Extract info from data-* attributes
//         var userName = button.data('user-name'); // Extract info from data-* attributes

//         //Get all roles
//         $.ajax({
//             url: '/role',
//             type: 'get',
//             success: function (allRoles) {
//                 //Get user roles
//                 //TODO should use promise instead of inner ajax
//                 var checkedArr = [];
//                 $.ajax({
//                     url: '/user/' + userId + '/role',
//                     type: 'get',
//                     success: function (userRoles) {
//                         userRoles.forEach(function (el) {
//                             checkedArr.push(el.role_id);
//                         });

//                         //Combine 2 arraies
//                         var rowArr = [];
//                         allRoles.forEach(function (el) {
//                             var isChecked = $.inArray(el.id, checkedArr) >= 0;
//                             rowArr.push([[el.id, isChecked], el.name, el.slug]);
//                         });

//                         usersRolesDt.rows.add(rowArr).draw();
//                     },
//                     error: function (xhr) {
//                     }
//                 });
//             },
//             error: function (xhr) {

//             }
//         });

//         var modal = $(this);
//         modal.find('.modal-title').text('Roles of ' + userName);
//         modal.find('.btn-ok')
//             .attr('data-user-id', userId)
//             .attr('data-user-name', userName);
//     })
//     .on('hidden.bs.modal', function (event) {
//         usersRolesDt.clear();
//     });

// $('#dashboard-users-roles-modal .btn-ok')
//     .click(function () {
//         var userId = $(this).attr('data-user-id');
//         var userName = $(this).attr('data-user-name');
//         console.log('update users-roles ' + userId + ' ' + userName);

//         $('#dashboard-users-roles-modal').modal('hide');
//     });

// $('#dashboard-users-permissions-modal')
//     .on('show.bs.modal', function (event) {
//         var button = $(event.relatedTarget); // Button that triggered the modal
//         var userId = button.data('user-id'); // Extract info from data-* attributes
//         var userName = button.data('user-name'); // Extract info from data-* attributes
//         // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
//         // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
//         var modal = $(this);
//         modal.find('.modal-title').text('Permissions of ' + userName);
//         modal.find('.btn-ok')
//             .attr('data-user-id', userId)
//             .attr('data-user-name', userName);
//     });

// $('#dashboard-users-permissions-modal .btn-ok')
//     .click(function () {
//         var userId = $(this).attr('data-user-id');
//         var userName = $(this).attr('data-user-name');
//         console.log('update users-permissions ' + userId + ' ' + userName);

//         $('#dashboard-users-permissions-modal').modal('hide');
//     });