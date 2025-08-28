import User from "../models/user.model.js";

const me = (req, res, next) => {
  try {
    const { email, name, ...rest } = req.user;
    return res.status(200).json({
      code: 200,
      message: "User get successfully",
      success: true,
      data: { email, name },
    });
  } catch (err) {
    next(err);
  }
};

const userList = async (req, res, next) => {
  try {
    const auth = req.user;
    const { perPage, page, order, expression, search } = req.query;
    const pagination = {
      perPage: perPage || 10,
      page: page || 1,
      order: order || "asc",
      expression: expression || "createdAt",
      search: search || "",
    };

    const users = await User.find({
      _id: { $ne: auth._id },
      $or: [
        { name: { $regex: pagination.search, $options: "i" } },
        { email: { $regex: pagination.search, $options: "i" } },
      ],
    })
      .sort({ [pagination.expression]: pagination.order })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const total = await User.countDocuments({ _id: { $ne: auth._id } });

    return res.status(200).json({
      code: 200,
      message: "User list get successfully",
      success: true,
      data: users,
      pagination: {
        perPage: Number(pagination.perPage),
        page: Number(pagination.page),
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    next(err);
  }
};

export { me, userList };
