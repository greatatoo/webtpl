$('#dashboard-users').DataTable({
    "processing": true,
    "serverSide": true,
    "ajax": {
        "url": "/datatable",
        "type": "POST",
        "data": {
            "_token":$('meta[name="csrf-token"]').attr('content'),//For Laravel VerifyCsrfToken Middleware 
            "table": "users",
            "primary_key": "id",
            "columns": [
                { "db": "account", "dt": "Account" },
                { "db": "name", "dt": "Name" },
                { "db": "email", "dt": "Email" },
                { "db": "created_at", "dt": "Created" }
            ]
        }
    },
    "columns": [
        { "data": "Account" },
        { "data": "Name" },
        { "data": "Email" },
        { "data": "Created" }
    ]
});