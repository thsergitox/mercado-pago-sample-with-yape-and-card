const open = require("open");
const path = require("path");
const express = require("express");
const mercadopago = require("mercadopago");

const mercadoPagoPublicKey = process.env.MERCADO_PAGO_SAMPLE_PUBLIC_KEY;
if (!mercadoPagoPublicKey) {
  console.log("Error: public key not defined");
  process.exit(1);
}

const mercadoPagoAccessToken = process.env.MERCADO_PAGO_SAMPLE_ACCESS_TOKEN;
if (!mercadoPagoAccessToken) {
  console.log("Error: access token not defined");
  process.exit(1);
}

const client = new mercadopago.MercadoPagoConfig({
  accessToken: mercadoPagoAccessToken,
});

const app = express();

app.set("view engine", "html");
app.engine("html", require("hbs").__express);
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./static"));
app.use(express.json());

app.get("/", function (req, res) {
  res.status(200).render("index", { mercadoPagoPublicKey });
});

app.get("/yape", function (req, res) {
  res.status(200).render("yape", { mercadoPagoPublicKey });
});

app.post("/process_payment", (req, res) => {
  const { body } = req;
  const { payer } = body;

  const payment = new mercadopago.Payment(client);

  const paymentData = {
    transaction_amount: Number(body.transactionAmount),
    token: body.token,
    description: body.description,
    installments: Number(body.installments),
    payment_method_id: body.paymentMethodId,
    issuer_id: body.issuerId,
    payer: {
      email: payer.email,
      identification: {
        type: payer.identification.docType,
        number: payer.identification.docNumber,
      },
    },
  };

  payment
    .create({ body: paymentData, requestOptions: { idempotencyKey: 'bailalorocky4423423423ahahahahahahaha' } })
    .then(function (data) {
      res.status(201).json({
        detail: data.status_detail,
        status: data.status,
        id: data.id,
      });
    })
    .catch(function (error) {
      console.log(error);
      const { errorMessage, errorStatus } = validateError(error);
      res.status(errorStatus).json({ error_message: errorMessage });
    });
});

app.post("/process_payment_yape", (req, res) => {
  const { body } = req;
  const { payer } = body;

  const payment = new mercadopago.Payment(client);

  const paymentData = {
    transaction_amount: Number(body.transaction_amount),
    token: body.token,
    description: body.description,
    installments: Number(body.installments),
    payment_method_id: body.payment_method_id, // Should be 'yape'
    payer: {
      email: payer.email,
    },
  };

  payment
    .create({ body: paymentData, requestOptions: { idempotencyKey: `yape_${Date.now()}_${Math.random()}` } })
    .then(function (data) {
      res.status(201).json({
        detail: data.status_detail,
        status: data.status,
        id: data.id,
      });
    })
    .catch(function (error) {
      console.log(error);
      const { errorMessage, errorStatus } = validateError(error);
      res.status(errorStatus).json({ error_message: errorMessage });
    });
});

function validateError(error) {
  let errorMessage = "Unknown error cause";
  let errorStatus = 400;

  if (error.cause) {
    const sdkErrorMessage = error.cause[0]?.description || error.cause[0]?.message || error.cause[0]?.error || error.cause[0]?.error_description || error.cause[0]?.error_message || error.cause[0]?.error_message;
    errorMessage = sdkErrorMessage || errorMessage;

    const sdkErrorStatus = error.status;
    errorStatus = sdkErrorStatus || errorStatus;
  }

  return { errorMessage, errorStatus };
}

app.listen(8080, () => {
  console.log("The server is now running on port 8080");
  open("http://localhost:8080");
});
