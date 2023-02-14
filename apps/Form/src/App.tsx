import React, { useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space } from "antd";
import { Depend_handle, Handle } from "./config";

const App: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = ( values: any ) => {
    console.log( "Received values of form:", values );
  };

  const [dependNamesOptions, setDependNamesOptions] = useState( [{ label: "123", value: "123" }] );

  return (
    <div >
      <Form
        form={ form }
        name="dynamic_form_complex"
        onFinish={ onFinish }
      >
        <Form.List name="ConfigList">
          { ( fields, { add, remove } ) => (
            <>
              { fields.map( ( field ) => (
                <Space key={ field.key } align="baseline">
                  <Form.Item
                    { ...field }
                    label="name"
                    name={ [field.name, "name"] }
                    rules={ [{ required: true, message: "需要一个唯一的name" }] }

                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    { ...field }
                    label="init"
                    name={ [field.name, "init"] }
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    { ...field }
                    label="handle"
                    name={ [field.name, "handle"] }
                  >
                    <Input.TextArea rows={ 4 } defaultValue={ Handle } />
                  </Form.Item>
                  <Form.Item
                    { ...field }
                    label="depend_names"
                    name={ [field.name, "depend_names"] }
                    shouldUpdate={ ( prevValues, curValues ) => {
                      console.log( prevValues, curValues );
                      return true;
                    }
                    }
                  >
                    {
                      ( val ) => {
                        console.log( val );
                        return <Select mode="multiple" options={ dependNamesOptions } style={ { width: 200 } } />;
                      }
                    }

                  </Form.Item>
                  <Form.Item
                    { ...field }
                    label="depend_handle"
                    name={ [field.name, "depend_handle"] }
                  >
                    <Input.TextArea rows={ 4 } defaultValue={ Depend_handle } />
                  </Form.Item>
                  <MinusCircleOutlined onClick={ () => remove( field.name ) } />
                </Space>
              ) ) }

              <Form.Item>
                <Button type="dashed" onClick={ () => add() } block icon={ <PlusOutlined /> }>
                  添加状态
                </Button>
              </Form.Item>
            </>
          ) }
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default App;
