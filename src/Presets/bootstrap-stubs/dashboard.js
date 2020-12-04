var render = {
    dtRowUserDetail: function (data) {
        console.log(data);
        var html = '<div class="container p-3">';

        html += '<div class="row mt-1">';
        html += '<label for="name" class="col-md-3 col-form-label text-md-right">Name</label>';
        html += '<div class="col-md-6">';
        html += '<input type="text" class="form-control name="name" value="" required>';
        html += '</div>';
        html += '</div>';

        html += '<div class="row mt-1">';
        html += '<label for="password" class="col-md-3 col-form-label text-md-right">Password</label>';
        html += '<div class="col-md-6">';
        html += '<input type="password" class="form-control name="password" value="">';
        html += '</div>';
        html += '</div>';

        html += '</div>';
        return html;
    }
};

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
                { "db": "id", "dt": "row_id" },
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
    }
});

// On each draw, loop over the `detailRows` array and show any child rows
usersDt.on('draw', function () {
    $.each(detailRows, function (i, id) {
        $('#' + id + ' td.details-control').trigger('click');
    });
});