import { useState } from "react";
import Button from "../Common/Button";
import Input from "../Common/Input";

export default function SkillForm({ initialValue = {}, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    name: initialValue.name || "",
    category: initialValue.category || "",
  });

  const set = (field) => (event) => {
    setForm((value) => ({ ...value, [field]: event.target.value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSubmit?.({
      ...initialValue,
      name: form.name.trim(),
      category: form.category.trim() || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Input
        label="Skill name"
        value={form.name}
        onChange={set("name")}
        placeholder="e.g. Electrical wiring"
        required
      />
      <Input
        label="Category"
        value={form.category}
        onChange={set("category")}
        placeholder="e.g. Electrical"
      />
      <Button type="submit" loading={submitting}>
        {initialValue._id ? "Save skill" : "Add skill"}
      </Button>
    </form>
  );
}
