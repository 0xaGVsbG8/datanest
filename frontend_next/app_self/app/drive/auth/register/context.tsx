"use client";
import { createContext } from "react";

export type manage_register_widgets_allowed_states =
  | "show whole widget"
  | "hide whole widget"
  | "show partial"
  | "";

export type manage_register_widgets_context_props = {
  set_show_manage_register_widgets: React.Dispatch<
    React.SetStateAction<manage_register_widgets_allowed_states>
  >;
  show_manage_register_widgets: manage_register_widgets_allowed_states;
  set_register_msg: React.Dispatch<React.SetStateAction<string>>;
};

export const manage_register_widgets_context_ =
  createContext<manage_register_widgets_context_props>({
    set_show_manage_register_widgets: () => {},
    show_manage_register_widgets: "",
    set_register_msg: () => {},
  });
