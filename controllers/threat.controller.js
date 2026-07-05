const Alert = require("../models/threat.model.js");

const normalizeBody = (body) =>
  Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key.trim(), value])
  );

const buildImageKitUrl = (filePath) => {
  if (!filePath) {
    return null;
  }

  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "");
  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${urlEndpoint}${normalizedPath}`;
};

const uploadImageToImageKit = async (file) => {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is required");
  }

  if (!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("IMAGEKIT_URL_ENDPOINT is required");
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const originalName = file.originalname || "alert-image";
  const safeOriginalName = originalName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const fileName = `alert-${uniqueSuffix}-${safeOriginalName}`;
  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const formData = new FormData();
  formData.append("file", base64Image);
  formData.append("fileName", fileName);
  formData.append("folder", "/alerts");
  formData.append("useUniqueFileName", "true");

  const authToken = Buffer.from(
    `${process.env.IMAGEKIT_PRIVATE_KEY}:`
  ).toString("base64");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authToken}`,
    },
    body: formData,
  });

  const responseText = await response.text();
  let result = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    result = {
      message: responseText,
    };
  }

  if (!response.ok) {
    throw new Error(
      `ImageKit upload failed (${response.status}): ${
        result.message || responseText || response.statusText
      }`
    );
  }

  const imageUrl = result.url || buildImageKitUrl(result.filePath);

  if (!imageUrl) {
    throw new Error("ImageKit upload succeeded but did not return a file URL");
  }

  return {
    imageUrl,
    imagekitFileId: result.fileId || null,
    imagekitFilePath: result.filePath || null,
  };
};


// Create Alert
exports.createAlert = async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const {
      cameraId,
      alertType,
      description,
    } = body;
    const score = Number(body.score);

    if (!cameraId || !alertType || !body.score || !description) {
      return res.status(400).json({
        success: false,
        message: "cameraId, alertType, score, and description are required",
      });
    }

    if (Number.isNaN(score)) {
      return res.status(400).json({
        success: false,
        message: "score must be a number",
      });
    }

    const imageUpload = req.file
      ? await uploadImageToImageKit(req.file)
      : {
          imageUrl: body.imageUrl,
          imagekitFileId: null,
          imagekitFilePath: null,
        };

    const alert = await Alert.create({
      cameraId,
      alertType,
      score,
      description,
      imageUrl: imageUpload.imageUrl,
      imagekitFileId: imageUpload.imagekitFileId,
      imagekitFilePath: imageUpload.imagekitFilePath,
    });

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      payload: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Alerts By Camera
exports.getCameraAlerts = async (req, res) => {
  try {
    const { cameraId } = req.query;

    const alerts = await Alert.find({
      cameraId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      payload: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// Get Single Alert
exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      payload: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
