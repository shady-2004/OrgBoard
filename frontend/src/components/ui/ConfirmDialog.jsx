import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'تأكيد', 
  cancelText = 'إلغاء',
  confirmVariant = 'danger',
  isLoading = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <p className="text-gray-700 text-base leading-relaxed">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <Button 
            variant="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التنفيذ...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
