import { useState } from "react";
import Swal from "sweetalert2";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID = import.meta.env.PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY;

interface FormData {
  name: string;
  email: string;
  message: string;
  honeypot: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const SwishContact = () => {  // 👈 was missing
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    honeypot: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const showToast = (icon: "success" | "error", title: string) => {
    Swal.fire({
      position: "top-end",
      icon,
      title,
      color: "#ffffff",
      background: "#444444",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
      timerProgressBar: true,
      width: "280px",
      customClass: {
        popup: "!text-[1rem] !py-2 !px-3",
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.honeypot) return;

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        },
        EMAILJS_PUBLIC_KEY
      );

      showToast("success", "Message sent!");
      setFormData({ name: "", email: "", message: "", honeypot: "" }); 
      setErrors({});
    } catch (error) {
      showToast("error", "Failed to send. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="contact" id="contact">
        <div className="contact-container">
          <div className="contact-inner">
            <div className="contact-left">
              <h1 className="hitmeup">
                <span className="text-[#db6163]"> Hit </span> me up
              </h1>
              <div className="contact-form">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="credentials">
                    <div className="input-wrapper">
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your Name:"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {errors.name && <span className="error-msg">{errors.name}</span>}
                    </div>

                    <div className="input-wrapper">
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter a valid email address:"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <span className="error-msg">{errors.email}</span>}
                    </div>
                  </div>

                  <div className="submission">
                    <div className="flex flex-col">
                      <textarea
                        className="textarea-contact"
                        name="message"
                        placeholder="Message:"
                        rows={6}
                        cols={100}
                        value={formData.message}
                        onChange={handleChange}
                      />
                      {errors.message && <span className="error-msg">{errors.message}</span>}
                    </div>

                    <button
                      className="contact-btn"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </button>
                  </div>

                  <input
                    type="text"
                    name="honeypot"
                    value={formData.honeypot}
                    onChange={handleChange}
                    style={{ display: "none" }}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SwishContact;