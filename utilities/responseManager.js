exports.onSuccess = (message, data, res) => {
    res.status(200).json({
        Message : message,
        Data : data,
        Status : true,
        IsSuccess  : true
    });
}

exports.badrequest = (error, res) => {
    res.status(400).json({
        Message : error.message,
        Data  : 0,
        Status : false,
        IsSuccess : false
    });
}
exports.onError = (error, res) => {
	res.status(500).json({
		Message: error,
		Data: 0,
		Status: 500,
		IsSuccess: false
	});
};
exports.unauthorisedRequest = (res) => {
	res.status(401).json({
		Message: "Unauthorized Request!",
		Data: 0,
		Status: 401,
		IsSuccess: false
	});
};
