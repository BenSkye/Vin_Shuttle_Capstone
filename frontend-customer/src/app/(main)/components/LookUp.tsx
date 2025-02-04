import React, { useState } from "react";
import { Menu } from "antd";

const LookUp = ({ onTabChange }) => {
    const [selected, setSelected] = useState("search");

    return (
        <Menu mode="horizontal" selectedKeys={[selected]} onClick={(e) => { setSelected(e.key); onTabChange(e.key); }}>
            <Menu.Item key="search">TRA CỨU</Menu.Item>
            <Menu.Item key="directions">TÌM ĐƯỜNG</Menu.Item>
        </Menu>
    );
};

export default LookUp;