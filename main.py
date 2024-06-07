import ast

import gradio as gr
import pandas as pd
import sympy as sp


def calc(input):
    try:
        result = str(sp.sympify(input))
    except Exception:
        result = " "
    return result


with open("./js/funcs.js", "rt", encoding="UTF-8") as f:
    js_ = f.read()
head = f"<script>{js_}</script>"
with gr.Blocks(head=head) as app:

    input_text = gr.Textbox(label="Поле ввода")
    result_text = gr.Textbox(label="Результат", interactive=False)
    save_button = gr.Button("Сохранить")
    input_text.change(calc, input_text, result_text)

    dataframe = gr.DataFrame(pd.DataFrame([], columns=["Input", "Output"]))

    @save_button.click(inputs=[input_text, result_text], outputs=dataframe, js="function f1(input, output) {addHistory(input, output); return getAllHistory();}")
    def save(history, uselessdata):
        obj = ast.literal_eval(history)
        return pd.DataFrame([[note["input"], note["output"]] for note in obj][::-1], columns=["Input", "Output"])

    clear_btn = gr.Button("Очистить")
    @clear_btn.click(inputs=input_text, outputs=dataframe, js="function f2(arg) {clearHistory(); return 0;}")
    def clear(*args):
        return pd.DataFrame([], columns=["Input", "Output"])


app.launch()
