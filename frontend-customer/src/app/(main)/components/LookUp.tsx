import React, { useState } from "react";
import { Menu } from "antd";
import type { MenuProps } from "antd";

interface LookUpProps {
    onTabChange: (key: string) => void;
}

const LookUp: React.FC<LookUpProps> = ({ onTabChange }) => {
    const [selected, setSelected] = useState("search");

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        setSelected(e.key);
        onTabChange(e.key);
    };

    return (
        <Menu
            mode="horizontal"
            selectedKeys={[selected]}
            onClick={handleMenuClick}
        >
            <Menu.Item key="search">TRA CỨU</Menu.Item>
            <Menu.Item key="directions">TÌM ĐƯỜNG</Menu.Item>
        </Menu>
    );
};

export default LookUp;