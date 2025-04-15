"use client";
import { useEffect, useState } from "react";
import { Layout, Table, Tabs, Button, Form, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import Sidebar from "../../_components/common/Sidebar";
import UpdateConfig from "../../_components/money/updateConfig";
import UpdatePrice from "../../_components/money/updatePrice";
import { pricingConfigServices } from "../../services/pricingServices";
import { priceManagementServices } from "../../services/priceConfigServices";
import { categoryService } from "../../services/categoryServices";
import { PricingConfig, PriceManagement } from "../../services/interface";
import AddPrice from "../../_components/money/addPrice";

const { Header, Content } = Layout;

// Map cho loại dịch vụ
const serviceTypeMap: { [key: string]: string } = {
  booking_hour: "Đặt xe theo giờ",
  booking_destination: "Đặt xe theo điểm đến",
  booking_share: "Đặt xe đi chung",
  booking_scenic_route: "Đặt xe lộ trình tham quan",
  booking_bus_route: "Chuyến xe buýt",
};

export default function Money() {
  const [serviceConfigs, setServiceConfigs] = useState<PricingConfig[]>([]);
  const [prices, setPrices] = useState<PriceManagement[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(
    null
  );
  const [form] = Form.useForm();
  const [editPriceModalVisible, setEditPriceModalVisible] = useState(false);
  const [, setEditingPrice] = useState<PriceManagement | null>(null);
  const [priceForm] = Form.useForm();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsData, pricesData, categoriesData] = await Promise.all([
        pricingConfigServices.getServiceConfigs(),
        priceManagementServices.getPrices(),
        categoryService.getCategories(),
      ]);

      setServiceConfigs(configsData);
      setPrices(pricesData);

      const categoryMap = categoriesData.reduce(
        (acc, category) => ({
          ...acc,
          [category._id]: category.name,
        }),
        {}
      );
      setCategories(categoryMap);
    } catch (error: unknown) {
      console.log(error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: PricingConfig) => {
    setEditingConfig(record);
    form.setFieldsValue({
      base_unit: record.base_unit,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!editingConfig) return;

      await priceManagementServices.updateServiceConfig(
        editingConfig.service_type as
        | "booking_hour"
        | "booking_destination"
        | "booking_share"
        | "booking_scenic_route"
        | "booking_bus_route",
        {
          base_unit: Number(values.base_unit),
          base_unit_type: editingConfig.base_unit_type,
        }
      );

      message.success("Cập nhật thành công");
      setEditModalVisible(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật";
      message.error(errorMessage);
    }
  };

  const handleEditPrice = (record: PriceManagement) => {
    setEditingPrice(record);
    priceForm.setFieldsValue({
      vehicle_category: record.vehicle_category,
      service_config: record.service_config,
      tiered_pricing: record.tiered_pricing,
    });
    setEditPriceModalVisible(true);
  };

  const handleUpdatePrice = async () => {
    try {
      const values = await priceForm.validateFields();
      await pricingConfigServices.updatePricing(values);
      message.success("Cập nhật giá thành công");
      setEditPriceModalVisible(false);
      fetchData();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi cập nhật giá";
      message.error(errorMessage);
    }
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddSuccess = () => {
    setIsAddModalVisible(false);
    fetchData(); // Refresh danh sách
  };

  const configColumns: ColumnsType<PricingConfig> = [
    {
      title: "Loại dịch vụ",
      dataIndex: "service_type",
      key: "service_type",
      render: (service_type: string) =>
        serviceTypeMap[service_type] || service_type,
    },
    {
      title: "Đơn vị cơ bản",
      dataIndex: "base_unit",
      key: "base_unit",
    },
    {
      title: "Loại đơn vị",
      dataIndex: "base_unit_type",
      key: "base_unit_type",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];

  const priceColumns: ColumnsType<PriceManagement> = [
    {
      title: "Danh mục xe",
      dataIndex: "vehicle_category",
      key: "vehicle_category",
      render: (category_id: string) => categories[category_id] || "N/A",
    },
    {
      title: "Loại dịch vụ",
      dataIndex: "service_config",
      key: "service_config",
      render: (config_id: string) => {
        const config = serviceConfigs.find((c) => c._id === config_id);
        return config
          ? serviceTypeMap[config.service_type] || config.service_type
          : "N/A";
      },
    },
    {
      title: "Giá theo khoảng",
      dataIndex: "tiered_pricing",
      key: "tiered_pricing",
      render: (
        tiered_pricing: Array<{ _id: string; range: string; price: number }>,
        record: PriceManagement
      ) => {
        const config = serviceConfigs.find(
          (c) => c._id === record.service_config
        );
        const unit = config?.service_type === "booking_hour" ? "phút" : "km";

        return (
          <ul>
            {tiered_pricing.map((tier) => (
              <li key={tier._id}>
                {`${tier.range} ${unit}: ${tier.price.toLocaleString(
                  "vi-VN"
                )} VNĐ`}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Cập nhật lần cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button icon={<EditOutlined />} onClick={() => handleEditPrice(record)}>
          Sửa giá
        </Button>
      ),
    },
  ];

  const items = [
    {
      key: "1",
      label: "Cấu hình giá dịch vụ",
      children: (
        <Table
          columns={configColumns}
          dataSource={serviceConfigs}
          loading={loading}
          rowKey="_id"
        />
      ),
    },
    {
      key: "2",
      label: "Quản lý giá cả",
      children: (
        <>
          <div className="mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Thêm giá mới
            </Button>
          </div>
          <Table
            columns={priceColumns}
            dataSource={prices}
            loading={loading}
            rowKey="_id"
          />
        </>
      ),
    },
  ];

  return (
    <Layout>
      <Sidebar />
      <Layout>
        <Header className="bg-white p-4">
          <h2 className="text-xl font-semibold ml-7">Quản lý giá dịch vụ</h2>
        </Header>
        <Content className="m-6 p-6 bg-white">
          <Tabs defaultActiveKey="1" items={items} />
        </Content>
      </Layout>

      <UpdateConfig
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleUpdate}
        form={form}
      />

      <UpdatePrice
        visible={editPriceModalVisible}
        onCancel={() => setEditPriceModalVisible(false)}
        onOk={handleUpdatePrice}
        form={priceForm}
        categories={categories}
        serviceConfigs={serviceConfigs}
        serviceTypeMap={serviceTypeMap}
      />

      <AddPrice
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSuccess={handleAddSuccess}
        categories={categories}
        serviceConfigs={serviceConfigs}
        serviceTypeMap={serviceTypeMap}
      />
    </Layout>
  );
}
