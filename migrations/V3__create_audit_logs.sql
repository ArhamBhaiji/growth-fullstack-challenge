CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  parent_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  payment_method_id BIGINT,
  changes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES parents (id)
);

CREATE INDEX idx_audit_parent_id ON audit_logs(parent_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
