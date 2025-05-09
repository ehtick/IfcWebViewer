import { Icon } from "@iconify/react";
import { MenuItem, Popover } from "@mui/material";
import { useState } from "react";
import ModelFlipper from "../../../../bim-components/modelFlipper";
import { useComponentsContext } from "../../../../context/ComponentsContext";
import { ToolBarButton } from "./toolbarButton";

export const FlipButton = () => {
  const components = useComponentsContext();
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hoverTimeout, setHoverTimeout] = useState<number | undefined>();
  const [isHovered, setIsHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [orientation, setOrientation] = useState<'xAxis' | 'zAxis'>('xAxis');

  // Debounce hover handling to avoid rapid firing
  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const timeout = window.setTimeout(() => {
      setIsHovered(true); // Stable hover state
      setAnchorEl(target);
      setPopoverOpen(true);
    }, 1000); // Adjust debounce delay (300ms in this case)
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setIsHovered(false); // Clear hover state
    // Delay closing to allow users time to move to the popover
    setTimeout(() => {
      if (!isHovered) {
        setAnchorEl(null); // Close the popover only if not hovered
        setPopoverOpen(false);
      }
    }, 600); // Adjust delay to give users time to reach the popover
  };

  const handlePopoverMouseEnter = () => {
    // Keep the popover open if the mouse enters the popover
    setIsHovered(true);
  };

  const handlePopoverMouseLeave = () => {
    // Close the popover when the mouse leaves the popover area
    setPopoverOpen(false);
    setAnchorEl(null);
    setIsHovered(false);
  };

  const startFlip = () => {
    const flipper = components.get(ModelFlipper);
    flipper.enabled = true;
    setIsFlipped(!isFlipped);
    flipper.flip(orientation);
  };

  return (
    <div>
      <ToolBarButton
        toolTip={isFlipped ? `Flip ${orientation} back` : `Flip ${orientation}`}
        onClick={() => startFlip()}
        content={<Icon icon="icon-park-outline:rotate" />

        }
      />

      {/* pop over disabled whilst advanced flip feature is to come */}
      {/* Popover that appears above the button */}
      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverMouseLeave}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          onMouseEnter: handlePopoverMouseEnter,
          onMouseLeave: handlePopoverMouseLeave,
        }}
        disableRestoreFocus
      >
        <MenuItem onClick={() => { setOrientation(orientation === 'xAxis' ? 'zAxis' : 'xAxis') }}>
          <Icon icon="mdi:refresh" style={{ marginRight: '8px' }} />
          {orientation === 'xAxis' ? 'Flip y Axis' : 'Flip x Axis'}
        </MenuItem>
      </Popover>
    </div>
  );
};

export default FlipButton;
